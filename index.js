const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const cors = require("cors");
const bodyParser = require('body-parser')
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose.connect(
    process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log("DB connected");
    }
);

const categorySchema = new mongoose.Schema({
    catid: String,
    name: String,
});
const Category = new mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
    proid: String,
    name: String,
    catid: String,
    catname: String,
});
const Product = new mongoose.model("Product", productSchema);


app.post("/addcategory", (req, res) => {
    const { proid, name, catid, catname } = req.body;
    try {
        const category = new Category({
            proid,
            name,
            catid,
            catname,
        });
        category.save((err) => {
            if (err) {
                res.send(err);
            } else {
                res.send({ message: "Category Successfully Added!" });
            }
        });
    } catch (error) {
        res.json(error);
    }
});

app.post("/addproduct", (req, res) => {
    const { proid, name, catid, catname } = req.body;
    try {
        const product = new Product({
            proid,
            name,
            catid,
            catname,
        });
        product.save((err) => {
            if (err) {
                res.send(err);
            } else {
                res.send({ message: "Product Successfully Added!" });
            }
        });
    } catch (error) {
        res.json(error);
    }
});


app.get("/products", (req, res) => {
    Product.find(function(err, products) {
        if (err) {
            res.json(err);
        } else {
            res.json(products);
        }
    });
});

app.get("/categories", (req, res) => {
    Category.find(function(err, categories) {
        if (err) {
            res.json(err);
        } else {
            res.json(categories);
        }
    });
});

app.get("/product", (req, res) => {
    //Here we coud have use app.get("/product/id")
    //findbyid()
    Product.findOne({ proid: req.query.proid }, (err, product) => {
        if (err) {
            res.json(err);
        } else {
            res.json(product);
        }
    });
});

app.get("/category", (req, res) => {
    Category.findOne({ catid: req.query.catid }, (err, category) => {
        if (err) {
            res.json(err);
        } else {
            res.json(category);
        }
    });
});

app.put("/product", async(req, res) => {
    //Here also we could have use product/:id 
    //You can use this too or FindAndModify too.
    // const update = Product.updateOne({ proid: req.body.proid }, { $set: (req.body) }, (err, product) => {
    //     if (err) {
    //         res.json(err);
    //     } else {
    //         console.log(product);
    //         res.json('Updated');
    //     }
    // })
    const update = await Product.updateOne({ proid: req.body.proid }, { $set: (req.body) })
    if (update.modifiedCount = 1) {
        res.json('Updated')
    } else {
        res.json('Something')
    }
});

app.put("/category", async(req, res) => {
    const update = await Category.updateOne({ catid: req.body.catid }, { $set: (req.body) })
    if (update.modifiedCount = 1) {
        res.json('Updated')
    } else {
        res.json('Something')
    }
});

app.delete("/product", async(req, res) => {
    //Here also we could have use product/:id and use findbyIdandRemove
    const remove = await Product.deleteOne({ proid: req.body.proid });
    if (remove.deletedCount == 1) {
        res.json('Deleted')
    } else {
        res.json('Something')
    }
    // console.log(remove)
    // Product.findByIdAndRemove(req.params.id, (err, product) => {
    //     if (err) {
    //         res.json(err);
    //     } else {
    //         res.json("Delected Successfully");
    //     }
    // });
});

app.delete("/category", async(req, res) => {
    const remove = await Category.deleteOne({ catid: req.body.catid });
    if (remove.deletedCount == 1) {
        res.json('Deleted')
    } else {
        res.json('Something')
    }
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello from MrZulf!" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});