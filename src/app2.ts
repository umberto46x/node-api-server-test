import express from "express";
import { products } from "./products";
const app = express();
const users = [
  { id: 1, name: "Carlo" },
  { id: 2, name: "Mario" },
];
// request
// response
// users?name=Car
app.get("/users", ({ query: { name } }, res) => {
  console.log(name);
  res.json(users);
});

app.get("/users/:id", ({ params: { id } }, res) => {
  const user = users.find(({ id: userId }) => String(userId) === id);
  res.json(user);
});

app.get("/products", (req, res) => {
  const query = req.query;
  let copyProducts = [...products];
  if (query.typology !== undefined) {
    copyProducts = copyProducts.filter(
      (item) =>
        item.typology.toLowerCase() === (query.typology as string).toLowerCase()
    );
  }
  if (query.q) {
    copyProducts = copyProducts.filter(
      (item) =>
        item.name.toLowerCase().includes((query.q as string).toLowerCase()) ||
        item.description
          .toLowerCase()
          .includes((query.q as string).toLowerCase())
    );
  }
  res.json(copyProducts);
});

app.get("/products/:id", (req, res) => {
  const product = products.find((item) => String(item.id) === req.params.id);
  if (product) {
    res.json(product);
  } else res.status(404).json({ message: "product not found" });
});

app.listen(3000);
