const mongoose = require("mongoose");


const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    nutrition: {
      calories: {
        type: Number,
        default: 0,
      },

      protein: {
        type: Number,
        default: 0,
      },

      carbohydrates: {
        type: Number,
        default: 0,
      },

      fat: {
        type: Number,
        default: 0,
      },

      fiber: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    _id: false,
  }
);


const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash on Delivery",
        "Online",
      ],
      default: "Cash on Delivery",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },
    
    nutritionLogged: {
      type: Boolean,
      default: false,
    },

    deliveryAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },

    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "Order",
  orderSchema
);