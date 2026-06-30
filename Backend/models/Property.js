import mongoose from 'mongoose';

const propertySchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, enum: ['sale', 'rent'], required: true },
    propertyType: { type: String, required: true },
    location: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure .id is returned
    toObject: { virtuals: true }
});

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property;
