import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser, IUserMethods, IUserStatics } from '@/types';

type IUserModel = Model<IUser, {}, IUserMethods> & IUserStatics;

// User schema definition with enterprise features
const UserSchema = new Schema<IUser>({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  picture: {
    type: String,
    default: undefined
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true,
    default: undefined
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: true // Since we're using Google OAuth, email is pre-verified
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  roles: {
    type: [String],
    default: ['user'],
    enum: ['user', 'moderator', 'admin', 'super_admin']
  },
  permissions: {
    type: [String],
    default: [
      'questions:read',
      'questions:create',
      'answers:read',
      'answers:create',
      'comments:read',
      'comments:create',
      'profile:read',
      'profile:update'
    ]
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      answers: {
        type: Boolean,
        default: true
      },
      comments: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showActivity: {
        type: Boolean,
        default: true
      }
    }
  },
  profile: {
    github: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/.test(v);
        },
        message: 'Invalid GitHub URL format'
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/linkedin\.com\/in\/[a-zA-Z0-9_-]+$/.test(v);
        },
        message: 'Invalid LinkedIn URL format'
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+$/.test(v);
        },
        message: 'Invalid website URL format'
      }
    },
    location: {
      type: String,
      maxlength: 100,
      trim: true
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 20; // Max 20 skills
        },
        message: 'Maximum 20 skills allowed'
      }
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  },
  lastLoginAt: {
    type: Date,
    default: undefined
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(_doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ username: 1, isActive: 1 });
UserSchema.index({ reputation: -1, isActive: 1 });
UserSchema.index({ lastActiveAt: -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'profile.skills': 1 });

// Instance methods
UserSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

UserSchema.methods.updateReputation = function(points: number) {
  this.reputation = Math.max(0, this.reputation + points);
  return this.save();
};

UserSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

UserSchema.methods.hasRole = function(role: string): boolean {
  return this.roles.includes(role);
};

UserSchema.methods.getPublicProfile = function() {
  const publicFields = {
    _id: this._id,
    username: this.username,
    name: this.name,
    picture: this.picture,
    bio: this.bio,
    reputation: this.reputation,
    profile: this.profile,
    createdAt: this.createdAt,
    lastActiveAt: this.lastActiveAt
  };

  // Respect privacy settings
  if (this.preferences.privacy.profileVisibility === 'private') {
    return {
      _id: this._id,
      username: this.username,
      name: this.name,
      picture: this.picture,
      reputation: this.reputation
    };
  }

  if (!this.preferences.privacy.showActivity) {
    delete publicFields.lastActiveAt;
  }

  return publicFields;
};

// Static methods
UserSchema.statics.findByGoogleId = function(googleId: string) {
  return this.findOne({ googleId, isActive: true });
};

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

UserSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: username.toLowerCase(), isActive: true });
};

UserSchema.statics.getTopUsers = function(limit: number = 10) {
  return this.find({ isActive: true })
    .sort({ reputation: -1 })
    .limit(limit)
    .select('username name picture reputation profile.experience');
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Ensure username is lowercase if provided
  if (this.username) {
    this.username = this.username.toLowerCase();
  }
  
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Update lastActiveAt on save (except for initial creation)
  if (!this.isNew) {
    this.lastActiveAt = new Date();
  }
  
  next();
});

// Create and export the model
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;