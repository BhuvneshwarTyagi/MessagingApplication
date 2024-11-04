const app = require("./app");
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT;





const startapp = async() => {
  app.listen(PORT, () => {
    console.log('Auth Backend running on port ', `${PORT}`);
  });


};

startapp();