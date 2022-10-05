const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function listDishes(req, res){
  res.json ({data: dishes})
}

///READ////
let newDishId = dishes.length + 1;

function readDish(req, res) {
  res.json({ data: res.locals.dish })
}

///VALIDATES
function dishIdExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`
  });
}

function dishBodyExists(req, res, next){
  const { data : { name, description, price, image_url } = {} } = req.body;
  let message;
  
  if(!name || name === "")
    message = "Dish must include a name";
  
  else if(!description || description==="")
    message = "Dish must include description";
  
  else if (price <= 0 || !Number.isInteger(price))
    message = "Dish must have a price that is an integer greater than 0";
  
  else if(!image_url || image_url === "")
    message = " Dish must include a image_url";
  
  if(message) {
    return next({
      status:400,
      message: message,
      })
  }
  
  next();
  }

function dishBodyIdExists (req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  
  if(!id || id === dishId) {
    res.locals.dishId = dishId;
    return next();
  }
  
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  });
}

//Create a new dish object with id and href and push into the urls data 
function createDish(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}


///DELETE
function destory(req, res, next) {
  const { dishId } = req.params;
  const indexToDeleteFrom = dishes.findIndex(dish => dish.id === Number(dishId));
  dishes.splice(indexToDeleteFrom, 1);
  res.sendStatus(204);
}

///UPDATE

function updateDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  res.locals.dish = {
    id: res.locals.dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
};
  
  res.json({ data: res.locals.dish })
}

module.exports = {
  listDishes,
  createDish: [dishBodyExists, createDish],
  read: [dishIdExists, readDish],
  delete: [dishIdExists, destory],
  update: [dishIdExists, dishBodyExists, dishBodyIdExists, updateDish]
}
  