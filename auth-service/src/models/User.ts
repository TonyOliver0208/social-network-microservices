import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

// User schema definition
const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  picture: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    website: {
      type: String,
      trim: true,
      maxlength: 200
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      maxlength: 10
    },
    timezone: {
      type: String,
      default: 'UTC',
      maxlength: 50
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    signupSource: {
      type: String,
      default: 'direct',
      maxlength: 50
    },
    referrer: {
      type: String,
      maxlength: 200
    },
    ipAddress: {
      type: String,
      maxlength: 45
    },
    userAgent: {
      type: String,
      maxlength: 500
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for better performance
// Note: email and googleId indexes are automatically created by unique: true
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Instance methods
UserSchema.methods.toJSON = function(): any {
  const userObject = this.toObject();
  
  // Remove sensitive fields from JSON output
  delete userObject.__v;
  
  return {
    id: userObject._id,
    email: userObject.email,
    name: userObject.name,
    picture: userObject.picture,
    role: userObject.role,
    isEmailVerified: userObject.isEmailVerified,
    lastLoginAt: userObject.lastLoginAt,
    profile: userObject.profile,
    preferences: userObject.preferences,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt
  };
};

UserSchema.methods.toPublicProfile = function(): any {
  return {
    id: this._id,
    name: this.name,
    picture: this.picture,
    role: this.role,
    profile: {
      bio: this.profile?.bio,
      website: this.profile?.website,
      location: this.profile?.location
    }
  };
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByGoogleId = function(googleId: string) {
  return this.findOne({ googleId });
};

UserSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Pre-save middleware
UserSchema.pre<IUser>('save', function(next) {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  next();
});

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;