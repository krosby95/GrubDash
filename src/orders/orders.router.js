const router = require("express").Router();

const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");


// TODO: Implement the /orders routes needed to make the tests pass

router
  .route("/")
  .get(controller.listOrders)
  .post(controller.createOrder)
  .all(methodNotAllowed)

router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed)

module.exports = router;
