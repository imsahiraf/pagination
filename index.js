const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const cors = require("cors");
const bodyParser = require('body-parser');
const req = require("express/lib/request");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get("/next", (req, res) => {
    res.sendFile(path.join(__dirname, 'next.html'))
});

app.post("/addcategory", async(req, res) => {
    const { name, catid } = await req.body;
    console.log(req.body.name)
    try {
        const category = new Category({
            name,
            catid,
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
            res.send(err);
        } else {
            res.send(products);
        }
    });
});

app.get("/categories", (req, res) => {
    Category.find(function(err, categories) {
        if (err) {
            res.send(err);
        } else {
            res.send(categories);
        }
    });
});


app.get("/pagination", async(req, res) => {
    var page = req.query.page
    var page = parseInt(page) - 1
    var start = page * 10;
    const limit = await Product.find().sort({ _id: 1 }).skip(start).limit(10)
    res.send(limit)
})



app.get("/joinproduct", async(req, res) => {
    const join = await Product.aggregate([{ $lookup: { from: "categories", localField: "catid", foreignField: "catid", as: "category" } }])
    res.send(join)
})

app.get("/joinpagination", async(req, res) => {
    var pageno = req.query.pageno
    var pageno = parseInt(pageno) - 1
    var startfrom = pageno * 10;
    console.log(startfrom)
    const joinlimit = await Product.aggregate([{ $lookup: { from: "categories", localField: "catid", foreignField: "catid", as: "category" } }, { $sort: { "_id": 1 } }, { $skip: startfrom }, { $limit: 10 }])
    res.send(joinlimit)
})

app.get("/product", (req, res) => {
    //Here we coud have use app.get("/product/id")
    //findbyid()
    Product.findOne({ proid: req.query.proid }, (err, product) => {
        if (err) {
            res.send(err);
        } else {
            res.send(product);
        }
    });
});

app.get("/category", (req, res) => {
    Category.findOne({ catid: req.query.catid }, (err, category) => {
        if (err) {
            res.send(err);
        } else {
            res.send(category);
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
        res.send('Updated')
    } else {
        res.send('Something')
    }
});

app.put("/category", async(req, res) => {
    const update = await Category.updateOne({ catid: req.body.catid }, { $set: (req.body) })
    if (update.modifiedCount = 1) {
        res.send('Updated')
    } else {
        res.send('Something')
    }
});

app.delete("/product", async(req, res) => {
    //Here also we could have use product/:id and use findbyIdandRemove
    const remove = await Product.deleteOne({ proid: req.body.proid });
    if (remove.deletedCount == 1) {
        res.send('Deleted')
    } else {
        res.send('Something')
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
    console.log(req.body.catid)
    const remove = await Category.deleteOne({ catid: req.body.catid });
    if (remove.deletedCount == 1) {
        res.send('Deleted')
    } else {
        res.send('Something')
    }
});

app.get("/api", (req, res) => {
    res.json('Hello from MrZulf!');
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});