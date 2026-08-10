import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
  upiId: string;
  qrCode: string; // base64 string
  accountName: string;
  instructions: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    upiId: {
      type: String,
      required: true,
      default: 'streamkart@upi',
    },
    qrCode: {
      type: String,
      required: true,
      default: '',
    },
    accountName: {
      type: String,
      required: true,
      default: 'StreamKart Official',
    },
    instructions: {
      type: String,
      required: true,
      default: 'Please scan the QR code or use the UPI ID to make the payment. After payment, upload a clear screenshot of the successful transaction.',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const PaymentSettings = mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings;
