const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.sendFile(__dirname+"/index.html")
})
app.post("/launch-container", (req, res) => {
    const { osImage, name } = req.body;

    console.log("Received from frontend:");
    console.log("OS Image:", osImage);
    console.log("Container Name:", name);

    // Later you can run:
    // docker run -d --name name osImage

    res.json({
        success: true,
        message: `Container '${name}' with image '${osImage}' received`
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
