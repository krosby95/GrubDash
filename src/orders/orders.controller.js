const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function listOrders(req, res) {
  res.json({ data: orders });
}
let newOrderId = orders.length + 1;

function readOrder(req, res) {
  res.json({ data: res.locals.order });
}

///CREATE

function createOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status ? status : "pending",
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

///UPDATE
function updateOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  res.locals.order = {
    id: res.locals.order.id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    status: status,
  };

  res.json({ data: res.locals.order });
}

///VALIDATIONS

function validateOrderId(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

function orderStatus(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, status } = {} } = req.body;

  let message;
  if (id && id !== orderId)
    message = `Oder id doesnt match with route id. Oder: ${id}, Route: ${orderId}`;
  else if (
    !status ||
    status === "" ||
    (status !== "pending" &&
      status !== "preparing" &&
      status !== "out-for-delivery")
  )
    message =
      "Order must have a status of pending, preparing, out-for-delivery, delivered";
  else if (status == "delivered") message = "A delivered order can't be change";

  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }
  next();
}

function orderExists(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  let message;

  if (!deliverTo || deliverTo === "")
    message = "Order must include a deliverTo";
  else if (!mobileNumber || mobileNumber === "")
    message = "Order must include a mobileNumber";
  else if (!dishes) message = "Order must include a dish";
  else if (!Array.isArray(dishes) || dishes.length === 0)
    message = "Order has to include at least one dish";
  else {
    for (let i = 0; i < dishes.length; i++) {
      if (
        !dishes[i].quantity ||
        dishes[i].quantity <= 0 ||
        !Number.isInteger(dishes[i].quantity)
      )
        message = `Dish ${i} must have a quantity higher than 0`;
    }
  }
  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }
  next();
}

/////DELETE

/*function destroy(req, res, next) {
  const { orderId } = req.params;
  const indexToDeleteFrom = orders.findIndex(order => order.id === Number(orderId));
  orders.splice(indexToDeleteFrom, 1);
  res.sendStatus(204);
}*/

function destroy(req, res, next) {
  const i = orders.indexOf(res.locals.order);
  orders.splice(i, 1);
  res.sendStatus(204);
}

function validateDelete(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: "an order cannot be deleted unless its pending",
    });
  }
  next();
}

module.exports = {
  listOrders,
  createOrder: [orderExists, createOrder],
  read: [validateOrderId, readOrder],
  update: [orderExists, validateOrderId, orderStatus, updateOrder],
  delete: [validateOrderId, validateDelete, destroy],
};
