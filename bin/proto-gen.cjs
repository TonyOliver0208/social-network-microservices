#!/usr/bin/env node

/**
 * Proto Code Generator
 * Generates TypeScript interfaces from Protocol Buffer definitions
 * 
 * Features:
 * - No external dependencies (protoc not required)
 * - Works with any file path
 * - Fast and lightweight
 * - Generates type-safe interfaces and service definitions
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROTO_DIR = path.join(ROOT_DIR, 'proto');
const OUTPUT_DIR = path.join(ROOT_DIR, 'generated');

console.log('🚀 Generating TypeScript interfaces from proto files...\n');

// Clean generated directory
if (fs.existsSync(OUTPUT_DIR)) {
  console.log('🧹 Cleaning generated directory...');
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Get all proto files
const protoFiles = fs.readdirSync(PROTO_DIR).filter(file => file.endsWith('.proto'));

if (protoFiles.length === 0) {
  console.error('❌ No proto files found in', PROTO_DIR);
  process.exit(1);
}

console.log(`📦 Found ${protoFiles.length} proto files:`);
protoFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

/**
 * Parse a proto file and generate TypeScript interfaces
 * @param {string} protoContent - Content of the proto file
 * @param {string} serviceName - Name of the service
 * @returns {string} Generated TypeScript code
 */
function generateTypeScriptFromProto(protoContent, serviceName) {
  const lines = protoContent.split('\n');
  let output = `/* eslint-disable */\n`;
  output += `/**\n * Auto-generated from ${serviceName}.proto\n * DO NOT EDIT MANUALLY\n */\n`;
  output += `import { Observable } from 'rxjs';\n\n`;
  
  let currentMessage = null;
  let currentService = null;
  const messages = [];
  const services = [];
  
  for (let line of lines) {
    line = line.trim();
    
    // Parse message definitions
    if (line.startsWith('message ')) {
      currentMessage = {
        name: line.match(/message\s+(\w+)/)[1],
        fields: []
      };
    } else if (currentMessage && line.startsWith('}')) {
      messages.push(currentMessage);
      currentMessage = null;
    } else if (currentMessage && line.includes(' = ')) {
      // Parse field: type name = number;
      const match = line.match(/(repeated\s+)?(\w+)\s+(\w+)\s*=\s*(\d+)/);
      if (match) {
        const [, repeated, type, name] = match;
        currentMessage.fields.push({
          name,
          type: mapProtoTypeToTS(type),
          repeated: !!repeated
        });
      }
    }
    
    // Parse service definitions
    if (line.startsWith('service ')) {
      currentService = {
        name: line.match(/service\s+(\w+)/)[1],
        methods: []
      };
    } else if (currentService && line.startsWith('}')) {
      services.push(currentService);
      currentService = null;
    } else if (currentService && line.startsWith('rpc ')) {
      // Parse RPC: rpc MethodName(Request) returns (Response);
      const match = line.match(/rpc\s+(\w+)\s*\((\w+)\)\s+returns\s+\((\w+)\)/);
      if (match) {
        const [, methodName, requestType, responseType] = match;
        currentService.methods.push({
          name: methodName,
          request: requestType,
          response: responseType
        });
      }
    }
  }
  
  // Generate message interfaces
  for (const msg of messages) {
    output += `export interface ${msg.name} {\n`;
    for (const field of msg.fields) {
      const type = field.repeated ? `${field.type}[]` : field.type;
      output += `  ${field.name}?: ${type};\n`;
    }
    output += `}\n\n`;
  }
  
  // Generate service interfaces
  for (const svc of services) {
    output += `export interface ${svc.name} {\n`;
    for (const method of svc.methods) {
      output += `  ${method.name}(request: ${method.request}): Observable<${method.response}>;\n`;
    }
    output += `}\n\n`;
    
    // Also export the service name for ClientGrpc.getService()
    output += `export const ${svc.name.toUpperCase()}_SERVICE_NAME = '${svc.name}';\n\n`;
  }
  
  return output;
}

/**
 * Map proto types to TypeScript types
 * @param {string} protoType - Proto type name
 * @returns {string} TypeScript type
 */
function mapProtoTypeToTS(protoType) {
  const typeMap = {
    'string': 'string',
    'int32': 'number',
    'int64': 'number',
    'uint32': 'number',
    'uint64': 'number',
    'sint32': 'number',
    'sint64': 'number',
    'fixed32': 'number',
    'fixed64': 'number',
    'sfixed32': 'number',
    'sfixed64': 'number',
    'bool': 'boolean',
    'double': 'number',
    'float': 'number',
    'bytes': 'Uint8Array',
  };
  
  return typeMap[protoType] || protoType;
}

// Generate TypeScript for each proto file
protoFiles.forEach(protoFile => {
  const serviceName = path.basename(protoFile, '.proto');
  console.log(`⚙️  Generating ${serviceName}.ts...`);
  
  try {
    const protoPath = path.join(PROTO_DIR, protoFile);
    const protoContent = fs.readFileSync(protoPath, 'utf8');
    const tsContent = generateTypeScriptFromProto(protoContent, serviceName);
    
    const outputPath = path.join(OUTPUT_DIR, `${serviceName}.ts`);
    fs.writeFileSync(outputPath, tsContent);
    
    console.log(`   ✅ ${serviceName}.ts generated`);
  } catch (error) {
    console.error(`   ❌ Failed to generate ${serviceName}:`, error.message);
  }
});

// Create index.ts for easy imports
const indexPath = path.join(OUTPUT_DIR, 'index.ts');
const exportStatements = protoFiles.map(file => {
  const name = path.basename(file, '.proto');
  return `export * from './${name}';`;
}).join('\n');

fs.writeFileSync(indexPath, exportStatements + '\n');
console.log('\n📝 Created index.ts for barrel exports');

console.log('\n✨ Proto code generation completed!\n');
console.log('📁 Generated files location:', OUTPUT_DIR);
console.log('💡 Usage examples:');
console.log('   import { AuthService, LoginRequest, LoginResponse, AUTH_SERVICE_SERVICE_NAME } from "@app/proto"');
console.log('   import { UserService, USER_SERVICE_SERVICE_NAME } from "@app/proto/user"');
console.log('\n   const authService = this.client.getService<AuthService>(AUTH_SERVICE_SERVICE_NAME);');
console.log('');
