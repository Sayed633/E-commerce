const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const port = 4000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect("mongodb+srv://sydahmd1103:ahmad%40123@cluster0.wt2tnex.mongodb.net/E-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Database connection error:", err));

// Create upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Image storage engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Serve static files
app.use('/images', express.static(uploadDir));

// API Creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: true,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Product Schema 
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: String,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

const Product = mongoose.model("Product", productSchema);

// Add product endpoint
app.post('/addproduct', async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 }).exec();
        const id = lastProduct ? lastProduct.id + 1 : 1;

        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        console.log("Product Saved:", product);
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error("Error Saving Product:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

// Remove product endpoint
app.post('/removeproduct', async (req, res) => {
    try {
        const removedProduct = await Product.findOneAndDelete({ id: req.body.id });

        if (removedProduct) {
            console.log("Product Removed:", removedProduct);
            res.json({
                success: true,
                name: removedProduct.name,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error Removing Product:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

// Get all products endpoint
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        console.log("All Products Fetched");
        res.json(products);
    } catch (error) {
        console.error("Error Fetching Products:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

// User Schema
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Sign-up endpoint
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
        }
        console.log("reached")
        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();
        const data = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });

    } catch (error) {
        console.error("Signup Error: ", error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    console.log("reached")
    try {
        
        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            const passCompare = req.body.password === user.password;
            if (passCompare) {
                const data = {
                    user: {
                        id: user.id
                    }
                };
                const token = jwt.sign(data, 'secret_ecom');
                res.json({ success: true, token });
            } else {
                res.status(401).json({ success: false, errors: "Wrong Password" });
            }
        } else {
            res.status(404).json({ success: false, errors: "Wrong Email Id" });
        }
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ errors: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ errors: "Please authenticate using a valid token" });
    }
};

// Add product to cart endpoint
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        userData.cartData[req.body.itemId] += 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("Added");
    } catch (error) {
        console.error("Add to Cart Error: ", error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});

// Remove product from cart endpoint
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
            await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
            res.send("Removed");
        } else {
            res.status(400).json({ success: false, errors: "Item not in cart" });
        }
    } catch (error) {
        console.error("Remove from Cart Error: ", error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});

// Get cart data endpoint
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        res.json(userData.cartData);
    } catch (error) {
        console.error("Get Cart Error: ", error);
        res.status(500).json({ success: false, errors: "Server error" });
    }
});

// Start server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.error("Error: " + error);
    }
});
