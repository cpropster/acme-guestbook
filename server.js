const fs = require("fs");
const http = require("http");

const server = http.createServer((req, res) => {
  console.log('in request handler');
  if (req.url === "/") {
    readFile("./index.html").then((html) => {
      res.write(html);
      res.end();
    });
  } else if (req.url === "/api/guests") {
    console.log('in api/guests', req.method);
    if (req.method === "GET") {
      readFile("./guests.json").then((html) => {
        res.write(html);
        res.end();
      });
    } else if (req.method === "POST") {
      console.log('in posts');
      let buffer = "";
      req.on("data", (chunk) => {
        buffer += chunk;
      });
      req.on("end", () => {
        const guest = JSON.parse(buffer);
        addGuest(guest).then((g) => {
          res.write(JSON.stringify(g));
          res.end();
        });
      });
    } else {
      res.statusCode = 404;
      res.write("error");
      res.end();
    }
  }
});

server.listen(3000, () => {
  console.log("listening on 3000");
});

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};

const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addGuest = (guest) => {
  return readFile("./guests.json")
    .then((data) => {
      const guests = JSON.parse(data);
      let max = guests.reduce((acc, guest) => {
        if (guest.id > acc) {
          acc = guest.id;
        }
        return acc;
      }, 0);
      guest.id = max + 1;
      guests.push(guest);
      return writeFile("./guests.json", JSON.stringify(guests, null, 2));
    })
    .then(() => {
      return guest;
    });
};
