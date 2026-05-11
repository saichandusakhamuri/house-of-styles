const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    customOrderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Custom order title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    referenceImages: [
      {
        url: String,
        description: String,
      },
    ],
    inspirationNotes: String,
    estimatedBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    desiredDate: {
      type: Date,
      required: [true, 'Desired completion date is required'],
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      default: 'moderate',
    },
    fabricPreference: [String],
    colorPreferences: [String],
    measurements: {
      chest: String,
      waist: String,
      length: String,
      shoulders: String,
      sleeves: String,
      additionalNotes: String,
    },
    quotedPrice: {
      type: Number,
      default: null,
    },
    quotedDate: Date,
    quotedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User', // Admin who quoted
    },
    status: {
      type: String,
      enum: ['inquiry', 'quoted', 'accepted', 'in-progress', 'completed', 'rejected', 'cancelled'],
      default: 'inquiry',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'pending',
    },
    advanceAmount: {
      type: Number,
      default: 0,
    },
    advancePaid: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    assignedDesigner: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User', // Designer assigned to this custom order
    },
    timeline: [
      {
        stage: String,
        description: String,
        expectedDate: Date,
        completedDate: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    communication: [
      {
        senderRole: {
          type: String,
          enum: ['user', 'designer', 'admin'],
        },
        message: String,
        attachments: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    finalImages: [
      {
        url: String,
        description: String,
      },
    ],
    feedback: String,
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    cancellationReason: String,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate custom order number before saving
customOrderSchema.pre('save', async function (next) {
  if (!this.customOrderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.customOrderNumber = `CUS-${timestamp}-${random}`;
  }
  next();
});

// Indexes for performance
customOrderSchema.index({ userId: 1, createdAt: -1 });
customOrderSchema.index({ status: 1 });
customOrderSchema.index({ assignedDesigner: 1 });
customOrderSchema.index({ customOrderNumber: 1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
