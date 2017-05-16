var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "Bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected as id:" + connection.threadId);
  showItems();
});

var showItems = function() {
  connection.query("SELECT * FROM products", function(err, reSult) {
    for (var i = 0; i < reSult.length; i++) {
      console.log(
        reSult[i].item_id +
          " || " +
          reSult[i].product_name +
          " || " +
          reSult[i].department_name +
          " || " +
          reSult[i].price +
          " || " +
          reSult[i].stock_quantity +
          "\n"
      );
    }

    promptCustomer(reSult);
  });
};

var promptCustomer = function(reSult) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "What would you like to purchase?"
      }
    ])
    .then(function(answer) {
      var correct = false;

      for (var i = 0; i < reSult.length; i++) {
        if (reSult[i].product_name === answer.choice) {
          correct = true;
          var product = answer.choice;
          var id = i;

          inquirer
            .prompt({
              type: "input",
              name: "quant",
              message: "How many would you like to purchase?",
              validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                } else {
                  return false;
                }
              }
            })
            .then(function(answer) {
              if (reSult[id].stock_quantity - answer.quant > 0) {
                var t = reSult[id].stock_quantity - answer.quant;

                connection.query(
                  "UPDATE products SET stock_quantity ='" +
                    t +
                    "'WHERE product_name = '" +
                    product +
                    "'",
                  function(err, reSult2) {
                    console.log("Thanks for your purchase!");

                    showItems();
                  }
                );
              } else {
                console.log("We dont have that quantity avialable");
                promptCustomer(reSult);
              }
            });
        }
      }
      if (i === reSult.length && correct == false) {
        console.log("Please make a valid selection!");
        promptCustomer(reSult);
      }
    });
};
