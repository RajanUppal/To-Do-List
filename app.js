//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main()
{
  await mongoose.connect('mongodb+srv://admin-rajan:rajan-1711@cluster0.u3gbear.mongodb.net/todolistDB');

  const itemsSchema = {
    name: String
  };

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Welcome to your To-Do List 👋"
  });

  const item2 = new Item({
    name: "Click ➕ add a new Item"
  });

  const item3 = new Item({
    name: "👈 Click to delete an item."
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);

  // await Item.insertMany(defaultItems);

  app.get("/", async function(req, res) {
    const foundItems = await Item.find({});
    if(foundItems.length == 0) {
      await Item.insertMany(defaultItems);
       res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

  app.get("/:customListName", async(req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    const foundList = await List.findOne({name: customListName});
    if(!foundList) {
      // Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
       res.redirect(`/${customListName}`);
    } else {
      // Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });


  app.post("/", async function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      item.save();
      res.redirect('/');
    } else {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    }
    
  });

  app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
    } else {
      const foundList = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
       res.redirect(`/${listName}`);
    }
    
  });

  
  
  app.get("/about", function(req, res){
    res.render("about");
  });
  
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });

}