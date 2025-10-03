import mongoose, { Document, Schema } from 'mongoose';

// RefreshToken interface extending mongoose Document
export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isActive: boolean;
  isUsed: boolean;
  usedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    deviceName?: string;
  };
}

// RefreshToken schema definition
const RefreshTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  revokedAt: {
    type: Date
  },
  metadata: {
    ipAddress: {
      type: String,
      maxlength: 45
    },
    userAgent: {
      type: String,
      maxlength: 500
    },
    deviceId: {
      type: String,
      maxlength: 100
    },
    deviceName: {
      type: String,
      maxlength: 100
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'refresh_tokens'
});

// Indexes for better performance
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });
RefreshTokenSchema.index({ isActive: 1 });
RefreshTokenSchema.index({ createdAt: -1 });

// Compound indexes
RefreshTokenSchema.index({ userId: 1, isActive: 1 });
RefreshTokenSchema.index({ token: 1, isActive: 1 });

// TTL index to automatically delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
RefreshTokenSchema.methods.toJSON = function(): any {
  const tokenObject = this.toObject();
  
  // Remove sensitive fields from JSON output
  delete tokenObject.__v;
  delete tokenObject.token; // Never expose the actual token
  
  return {
    id: tokenObject._id,
    userId: tokenObject.userId,
    expiresAt: tokenObject.expiresAt,
    isActive: tokenObject.isActive,
    isUsed: tokenObject.isUsed,
    usedAt: tokenObject.usedAt,
    revokedAt: tokenObject.revokedAt,
    createdAt: tokenObject.createdAt,
    updatedAt: tokenObject.updatedAt,
    metadata: tokenObject.metadata
  };
};

RefreshTokenSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

RefreshTokenSchema.methods.isValid = function(): boolean {
  return this.isActive && !this.isUsed && !this.isExpired();
};

RefreshTokenSchema.methods.revoke = function(): Promise<IRefreshToken> {
  this.isActive = false;
  this.revokedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

RefreshTokenSchema.methods.markAsUsed = function(): Promise<IRefreshToken> {
  this.isUsed = true;
  this.usedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
RefreshTokenSchema.statics.findValidToken = function(token: string, userId: string) {
  return this.findOne({
    token,
    userId,
    isActive: true,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

RefreshTokenSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId, isActive: true });
};

RefreshTokenSchema.statics.revokeAllForUser = function(userId: string) {
  return this.updateMany(
    { userId, isActive: true },
    { 
      isActive: false, 
      revokedAt: new Date(),
      updatedAt: new Date()
    }
  );
};

RefreshTokenSchema.statics.cleanupExpiredTokens = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Pre-save middleware
RefreshTokenSchema.pre('save', function(next: any) {
  // Auto-revoke if used
  if (this.isModified('isUsed') && this.isUsed && this.isActive) {
    this.isActive = false;
    this.revokedAt = new Date();
  }
  
  next();
});

// Create and export the model
const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

export default RefreshToken;