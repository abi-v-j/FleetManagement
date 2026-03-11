// -------------------- Imports --------------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// -------------------- App Setup --------------------
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb+srv://ruben:ruben@cluster0.xnoaqgt.mongodb.net/db_mainproject")
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });



// -------------------- File Upload Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


/* -------------------- PLACE (no district) -------------------- */
const placeSchema = new mongoose.Schema(
  {
    placeName: { type: String, required: true, trim: true, unique: true },
  },
  { collection: "places", timestamps: true }
);
const Place = mongoose.model("Place", placeSchema);



// ------------ PLACE (MINIMAL CRUD) ------------

// CREATE
app.post("/place", async (req, res) => {
  try {
    const placeName = (req.body.placeName || "").trim();
    if (!placeName) return res.status(400).json({ message: "placeName required" });

    await Place.create({ placeName });
    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already exists" });
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get("/place", async (req, res) => {
  try {
    const data = await Place.aggregate([
      { $sort: { createdAt: -1 } },
      { $project: { placeId: "$_id", placeName: 1, _id: 0 } },
    ]);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/place/:id", async (req, res) => {
  try {
    const placeName = (req.body.placeName || "").trim();
    if (!placeName) return res.status(400).json({ message: "placeName required" });

    const updated = await Place.findByIdAndUpdate(req.params.id, { placeName }, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/place/:id", async (req, res) => {
  try {
    const deleted = await Place.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- ADMIN -------------------- */
const adminSchema = new mongoose.Schema(
  {
    adminName: { type: String, required: true, trim: true },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    adminPassword: { type: String, required: true }, // store hashed
  },
  { collection: "admins", timestamps: true }
);
const Admin = mongoose.model("Admin", adminSchema);




// ------------ ADMIN (MINIMAL CRUD) ------------

// CREATE
app.post("/admin", async (req, res) => {
  try {
    const adminName = (req.body.adminName || "").trim();
    const adminEmail = (req.body.adminEmail || "").trim().toLowerCase();
    const adminPassword = (req.body.adminPassword || "").trim();

    if (!adminName || !adminEmail || !adminPassword)
      return res.status(400).json({ message: "adminName, adminEmail, adminPassword required" });

    await Admin.create({ adminName, adminEmail, adminPassword });
    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get("/admin", async (req, res) => {
  try {
    const data = await Admin.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $project: {
          adminId: "$_id",
          adminName: 1,
          adminEmail: 1,
          adminPassword: 1,
          _id: 0,
        },
      },
    ]);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/admin/:id", async (req, res) => {
  try {
    const adminName = (req.body.adminName || "").trim();
    const adminEmail = (req.body.adminEmail || "").trim().toLowerCase();
    const adminPassword = (req.body.adminPassword || "").trim();

    if (!adminName || !adminEmail || !adminPassword)
      return res.status(400).json({ message: "adminName, adminEmail, adminPassword required" });

    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      { adminName, adminEmail, adminPassword },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/admin/:id", async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- MANAGER -------------------- */
const managerSchema = new mongoose.Schema(
  {
    managerName: { type: String, required: true, trim: true },
    managerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    managerContact: { type: String, required: true, trim: true },
    managerAddress: { type: String, trim: true, default: "" },
    managerPassword: { type: String, required: true }, // store hashed
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    managerPhoto: { type: String, default: "" },
  },
  { collection: "managers", timestamps: true }
);
const Manager = mongoose.model("Manager", managerSchema);



// ------------ MANAGER (MINIMAL CRUD) ------------

// CREATE (with photo)
app.post("/manager", upload.single("managerPhoto"), async (req, res) => {
  try {
    const managerName = (req.body.managerName || "").trim();
    const managerEmail = (req.body.managerEmail || "").trim().toLowerCase();
    const managerContact = (req.body.managerContact || "").trim();
    const managerAddress = (req.body.managerAddress || "").trim();
    const managerPassword = (req.body.managerPassword || "").trim();
    const placeId = (req.body.placeId || "").trim();

    if (!managerName || !managerEmail || !managerContact || !managerPassword || !placeId)
      return res.status(400).json({ message: "All fields required" });

    const managerPhoto = req.file ? `/uploads/${req.file.filename}` : "";

    await Manager.create({
      managerName,
      managerEmail,
      managerContact,
      managerAddress,
      managerPassword,
      placeId,
      managerPhoto,
    });

    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// READ ALL (with place join)
app.get("/manager", async (req, res) => {
  try {
    const data = await Manager.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          managerId: "$_id",
          managerName: 1,
          managerEmail: 1,
          managerContact: 1,
          managerAddress: 1,
          managerPassword: 1,
          placeId: 1,
          placeName: "$place.placeName",
          managerPhoto: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (optional new photo)
app.put("/manager/:id", upload.single("managerPhoto"), async (req, res) => {
  try {
    const managerName = (req.body.managerName || "").trim();
    const managerEmail = (req.body.managerEmail || "").trim().toLowerCase();
    const managerContact = (req.body.managerContact || "").trim();
    const managerAddress = (req.body.managerAddress || "").trim();
    const managerPassword = (req.body.managerPassword || "").trim();
    const placeId = (req.body.placeId || "").trim();

    if (!managerName || !managerEmail || !managerContact || !managerPassword || !placeId)
      return res.status(400).json({ message: "All fields required" });

    const existing = await Manager.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Manager not found" });

    const managerPhoto = req.file ? `/uploads/${req.file.filename}` : existing.managerPhoto;

    await Manager.findByIdAndUpdate(req.params.id, {
      managerName,
      managerEmail,
      managerContact,
      managerAddress,
      managerPassword,
      placeId,
      managerPhoto,
    });

    res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/manager/:id", async (req, res) => {
  try {
    const deleted = await Manager.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Manager not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- MANAGER PROFILE --------------------
app.get("/manager/:id", async (req, res) => {
  try {
    const data = await Manager.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          managerId: "$_id",
          managerName: 1,
          managerEmail: 1,
          managerContact: 1,
          managerAddress: 1,
          placeId: 1,
          placeName: "$place.placeName",
          managerPhoto: 1,
          _id: 0,
        },
      },
    ]);

    if (!data.length) return res.status(404).json({ message: "Manager not found" });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- MANAGER CHANGE PASSWORD --------------------
app.put("/manager/changepassword/:id", async (req, res) => {
  try {
    const oldPassword = (req.body.oldPassword || "").trim();
    const newPassword = (req.body.newPassword || "").trim();

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "oldPassword and newPassword required" });

    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    if (manager.managerPassword !== oldPassword)
      return res.status(401).json({ message: "Old password incorrect" });

    manager.managerPassword = newPassword;
    await manager.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/manager/bookings/:managerId", async (req, res) => {
  try {
   

    const data = await Booking.aggregate([
     
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingFromplaceId",
          foreignField: "_id",
          as: "fromPlace",
        },
      },
      { $unwind: { path: "$fromPlace", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingToplaceId",
          foreignField: "_id",
          as: "toPlace",
        },
      },
      { $unwind: { path: "$toPlace", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          bookingId: "$_id",
          bookingAmount: 1,
          bookingFromdate: 1,
          bookingTodate: 1,
          bookingStatus: 1,

          userId: 1,
          userName: "$user.userName",
          userEmail: "$user.userEmail",
          userContact: "$user.userContact",

          vehicleId: 1,
          vehicleName: "$vehicle.vehicleName",
          vehiclePhoto: "$vehicle.vehiclePhoto",

          fromPlaceName: "$fromPlace.placeName",
          toPlaceName: "$toPlace.placeName",
          _id: 0,
        },
      },
    ]);

    return res.json({ data });
  } catch (err) {
    console.log("MANAGER BOOKINGS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});



// -------------------- MANAGER: ACCEPT BOOKING --------------------
app.put("/manager/booking/accept/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookingStatus !== 0)
      return res.status(400).json({ message: "Only pending booking can be accepted" });

    booking.bookingStatus = 1; // Accepted
    await booking.save();

    res.json({ message: "Accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- MANAGER: REJECT BOOKING --------------------
app.put("/manager/booking/reject/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookingStatus !== 0)
      return res.status(400).json({ message: "Only pending booking can be rejected" });

    booking.bookingStatus = 2; // Rejected
    await booking.save();

    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- USER -------------------- */
const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    userContact: { type: String, required: true, trim: true },
    userAddress: { type: String, required: true, trim: true },
    userPassword: { type: String, required: true }, // store hashed
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
  },
  { collection: "users", timestamps: true }
);
const User = mongoose.model("User", userSchema);



// ------------ USER (INSERT ONLY) ------------

app.post("/user", async (req, res) => {
  try {
    const userName = (req.body.userName || "").trim();
    const userEmail = (req.body.userEmail || "").trim().toLowerCase();
    const userContact = (req.body.userContact || "").trim();
    const userAddress = (req.body.userAddress || "").trim();
    const userPassword = (req.body.userPassword || "").trim();
    const placeId = (req.body.placeId || "").trim();

    if (!userName || !userEmail || !userContact || !userAddress || !userPassword || !placeId)
      return res.status(400).json({ message: "All fields required" });

    await User.create({
      userName,
      userEmail,
      userContact,
      userAddress,
      userPassword,
      placeId,
    });

    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Email already exists" });

    res.status(500).json({ error: err.message });
  }
});



// -------------------- USER PROFILE --------------------
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          userName: 1,
          userEmail: 1,
          userContact: 1,
          userAddress: 1,
          placeName: "$place.placeName",
          _id: 0,
        },
      },
    ]);

    if (!user.length)
      return res.status(404).json({ message: "User not found" });

    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- USER PROFILE UPDATE --------------------
app.put("/user/:id", async (req, res) => {
  try {
    const userName = (req.body.userName || "").trim();
    const userEmail = (req.body.userEmail || "").trim().toLowerCase();
    const userContact = (req.body.userContact || "").trim();
    const userAddress = (req.body.userAddress || "").trim();
    const placeId = (req.body.placeId || "").trim();

    if (!userName || !userEmail || !userContact || !userAddress || !placeId)
      return res.status(400).json({ message: "All fields required" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { userName, userEmail, userContact, userAddress, placeId },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    return res.status(500).json({ error: err.message });
  }
});




// -------------------- USER CHANGE PASSWORD --------------------
app.put("/user/changepassword/:id", async (req, res) => {
  try {
    const oldPassword = (req.body.oldPassword || "").trim();
    const newPassword = (req.body.newPassword || "").trim();

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "oldPassword and newPassword required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.userPassword !== oldPassword)
      return res.status(401).json({ message: "Old password incorrect" });

    user.userPassword = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- USER LIST (ADMIN) --------------------
app.get("/user", async (req, res) => {
  try {
    const data = await User.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          userName: 1,
          userEmail: 1,
          userContact: 1,
          userAddress: 1,
          placeName: "$place.placeName",
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- STAFF TYPE -------------------- */
const staffTypeSchema = new mongoose.Schema(
  {
    stafftypeName: { type: String, required: true, trim: true, unique: true },
  },
  { collection: "stafftypes", timestamps: true }
);
const Stafftype = mongoose.model("Stafftype", staffTypeSchema);



// ------------ STAFFTYPE (MINIMAL CRUD) ------------

// CREATE
app.post("/stafftype", async (req, res) => {
  try {
    const stafftypeName = (req.body.stafftypeName || "").trim();
    if (!stafftypeName) return res.status(400).json({ message: "stafftypeName required" });

    await Stafftype.create({ stafftypeName });
    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already exists" });
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get("/stafftype", async (req, res) => {
  try {
    const data = await Stafftype.aggregate([
      { $sort: { createdAt: -1 } },
      { $project: { stafftypeId: "$_id", stafftypeName: 1, _id: 0 } },
    ]);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/stafftype/:id", async (req, res) => {
  try {
    const stafftypeName = (req.body.stafftypeName || "").trim();
    if (!stafftypeName) return res.status(400).json({ message: "stafftypeName required" });

    const updated = await Stafftype.findByIdAndUpdate(
      req.params.id,
      { stafftypeName },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/stafftype/:id", async (req, res) => {
  try {
    const deleted = await Stafftype.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- STAFF -------------------- */
const staffSchema = new mongoose.Schema(
  {
    staffName: { type: String, required: true, trim: true },
    staffEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    staffContact: { type: String, required: true, trim: true },
    staffAddress: { type: String, required: true, trim: true },
    staffPassword: { type: String, required: true }, // store hashed
    staffPhoto: { type: String, default: "" },

    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    stafftypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stafftype",
      required: true,
    },
  },
  { collection: "staffs", timestamps: true }
);
const Staff = mongoose.model("Staff", staffSchema);



// ------------ STAFF (MINIMAL CRUD) ------------

// CREATE (with photo)
app.post("/staff", upload.single("staffPhoto"), async (req, res) => {
  try {
    const staffName = (req.body.staffName || "").trim();
    const staffEmail = (req.body.staffEmail || "").trim().toLowerCase();
    const staffContact = (req.body.staffContact || "").trim();
    const staffAddress = (req.body.staffAddress || "").trim();
    const staffPassword = (req.body.staffPassword || "").trim();
    const placeId = (req.body.placeId || "").trim();
    const stafftypeId = (req.body.stafftypeId || "").trim();

    if (!staffName || !staffEmail || !staffContact || !staffAddress || !staffPassword || !placeId || !stafftypeId)
      return res.status(400).json({ message: "All fields required" });

    const staffPhoto = req.file ? `/uploads/${req.file.filename}` : "";

    await Staff.create({
      staffName,
      staffEmail,
      staffContact,
      staffAddress,
      staffPassword,
      placeId,
      stafftypeId,
      staffPhoto,
    });

    res.json({ message: "Inserted Success" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// READ ALL (join place + stafftype)
app.get("/staff", async (req, res) => {
  try {
    const data = await Staff.aggregate([
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "stafftypes",
          localField: "stafftypeId",
          foreignField: "_id",
          as: "stype",
        },
      },
      { $unwind: { path: "$stype", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          staffId: "$_id",
          staffName: 1,
          staffEmail: 1,
          staffContact: 1,
          staffAddress: 1,
          staffPassword: 1,
          staffPhoto: 1,
          placeId: 1,
          placeName: "$place.placeName",
          stafftypeId: 1,
          stafftypeName: "$stype.stafftypeName",
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (optional new photo)
app.put("/staff/:id", upload.single("staffPhoto"), async (req, res) => {
  try {
    const staffName = (req.body.staffName || "").trim();
    const staffEmail = (req.body.staffEmail || "").trim().toLowerCase();
    const staffContact = (req.body.staffContact || "").trim();
    const staffAddress = (req.body.staffAddress || "").trim();
    const staffPassword = (req.body.staffPassword || "").trim();
    const placeId = (req.body.placeId || "").trim();
    const stafftypeId = (req.body.stafftypeId || "").trim();

    if (!staffName || !staffEmail || !staffContact || !staffAddress || !staffPassword || !placeId || !stafftypeId)
      return res.status(400).json({ message: "All fields required" });

    const existing = await Staff.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Staff not found" });

    const staffPhoto = req.file ? `/uploads/${req.file.filename}` : existing.staffPhoto;

    await Staff.findByIdAndUpdate(req.params.id, {
      staffName,
      staffEmail,
      staffContact,
      staffAddress,
      staffPassword,
      placeId,
      stafftypeId,
      staffPhoto,
    });

    res.json({ message: "Updated Successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/staff/:id", async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- STAFF PROFILE --------------------
app.get("/staff/:id", async (req, res) => {
  try {
    const data = await Staff.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

      {
        $lookup: {
          from: "places",
          localField: "placeId",
          foreignField: "_id",
          as: "place",
        },
      },
      { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "stafftypes",
          localField: "stafftypeId",
          foreignField: "_id",
          as: "stype",
        },
      },
      { $unwind: { path: "$stype", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          staffId: "$_id",
          staffName: 1,
          staffEmail: 1,
          staffContact: 1,
          staffAddress: 1,
          placeId: 1,
          placeName: "$place.placeName",
          stafftypeId: 1,
          stafftypeName: "$stype.stafftypeName",
          staffPhoto: 1,
          _id: 0,
        },
      },
    ]);

    if (!data.length) return res.status(404).json({ message: "Staff not found" });

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- STAFF CHANGE PASSWORD --------------------
app.put("/staff/changepassword/:id", async (req, res) => {
  try {
    const oldPassword = (req.body.oldPassword || "").trim();
    const newPassword = (req.body.newPassword || "").trim();

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "oldPassword and newPassword required" });

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.staffPassword !== oldPassword)
      return res.status(401).json({ message: "Old password incorrect" });

    staff.staffPassword = newPassword;
    await staff.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- VEHICLE -------------------- */
const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: { type: String, required: true, trim: true },
    vehiclePhoto: { type: String, required: true, trim: true },
    vehicleDescription: { type: String, required: true, trim: true },

    vehiclePrice: { type: Number, required: true },      // FIX: Number
    vehicleSeatcount: { type: Number, required: true },  // FIX: Number
  },
  { collection: "vehicles", timestamps: true }
);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);



// ------------ VEHICLE (MINIMAL CRUD) ------------

// CREATE (with photo)
app.post("/vehicle", upload.single("vehiclePhoto"), async (req, res) => {
  try {
    const vehicleName = (req.body.vehicleName || "").trim();
    const vehicleDescription = (req.body.vehicleDescription || "").trim();
    const vehiclePrice = Number(req.body.vehiclePrice);
    const vehicleSeatcount = Number(req.body.vehicleSeatcount);

    if (!vehicleName || !vehicleDescription || !Number.isFinite(vehiclePrice) || !Number.isFinite(vehicleSeatcount))
      return res.status(400).json({ message: "All fields required" });

    if (!req.file) return res.status(400).json({ message: "vehiclePhoto required" });

    const vehiclePhoto = `/uploads/${req.file.filename}`;

    await Vehicle.create({
      vehicleName,
      vehiclePhoto,
      vehicleDescription,
      vehiclePrice,
      vehicleSeatcount,
    });

    res.json({ message: "Inserted Success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get("/vehicle", async (req, res) => {
  try {
    const data = await Vehicle.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $project: {
          vehicleId: "$_id",
          vehicleName: 1,
          vehiclePhoto: 1,
          vehicleDescription: 1,
          vehiclePrice: 1,
          vehicleSeatcount: 1,
          _id: 0,
        },
      },
    ]);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (photo optional)
app.put("/vehicle/:id", upload.single("vehiclePhoto"), async (req, res) => {
  try {
    const vehicleName = (req.body.vehicleName || "").trim();
    const vehicleDescription = (req.body.vehicleDescription || "").trim();
    const vehiclePrice = Number(req.body.vehiclePrice);
    const vehicleSeatcount = Number(req.body.vehicleSeatcount);

    if (!vehicleName || !vehicleDescription || !Number.isFinite(vehiclePrice) || !Number.isFinite(vehicleSeatcount))
      return res.status(400).json({ message: "All fields required" });

    const existing = await Vehicle.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Vehicle not found" });

    const vehiclePhoto = req.file ? `/uploads/${req.file.filename}` : existing.vehiclePhoto;

    await Vehicle.findByIdAndUpdate(req.params.id, {
      vehicleName,
      vehiclePhoto,
      vehicleDescription,
      vehiclePrice,
      vehicleSeatcount,
    });

    res.json({ message: "Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/vehicle/:id", async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- VEHICLE BY ID --------------------
app.get("/vehicle/:id", async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Vehicle not found" });

    res.json({
      vehicleId: v._id,
      vehicleName: v.vehicleName,
      vehiclePhoto: v.vehiclePhoto,
      vehicleDescription: v.vehicleDescription,
      vehiclePrice: v.vehiclePrice,
      vehicleSeatcount: v.vehicleSeatcount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* -------------------- GALLERY -------------------- */
const gallerySchema = new mongoose.Schema(
  {
    galleryFile: { type: String, required: true, trim: true }, // paper: gallery_file
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  },
  { collection: "gallery", timestamps: true }
);
const Gallery = mongoose.model("Gallery", gallerySchema);


// ------------ GALLERY (MINIMAL CRUD) ------------

// CREATE (upload one image for a vehicle)
app.post("/gallery", upload.single("galleryFile"), async (req, res) => {
  try {
    const vehicleId = (req.body.vehicleId || "").trim();
    if (!vehicleId) return res.status(400).json({ message: "vehicleId required" });
    if (!req.file) return res.status(400).json({ message: "galleryFile required" });

    const galleryFile = `/uploads/${req.file.filename}`;

    await Gallery.create({ galleryFile, vehicleId });
    res.json({ message: "Inserted Success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// READ BY VEHICLE
app.get("/gallery/:vehicleId", async (req, res) => {
  try {
    const data = await Gallery.aggregate([
      { $match: { vehicleId: new mongoose.Types.ObjectId(req.params.vehicleId) } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          galleryId: "$_id",
          galleryFile: 1,
          vehicleId: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE (replace image)
app.put("/gallery/:id", upload.single("galleryFile"), async (req, res) => {
  try {
    const existing = await Gallery.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    const galleryFile = req.file ? `/uploads/${req.file.filename}` : existing.galleryFile;

    await Gallery.findByIdAndUpdate(req.params.id, { galleryFile });
    res.json({ message: "Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE
app.delete("/gallery/:id", async (req, res) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- BOOKING -------------------- */
/* FIX: Dates as Date, amount as Number, from/to place as ObjectId refs */
const bookingSchema = new mongoose.Schema(
  {
    bookingAmount: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now }, // paper has booking_date

    bookingFromdate: { type: Date, required: true },
    bookingTodate: { type: Date, required: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },

    bookingStatus: {
      type: Number,
      enum: [0, 1, 2, 3, 4], // 0: Pending, 1: Accepted, 2: Rejected, 3: Cancelled, 4: Completed
      default: 0,
    },

    bookingFromplaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    bookingToplaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
  },
  { collection: "bookings", timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);



// -------------------- BOOKING CHECK AVAILABILITY --------------------
app.post("/booking/check", async (req, res) => {
  try {
    const { vehicleId, bookingFromdate, bookingTodate } = req.body;

    if (!vehicleId || !bookingFromdate || !bookingTodate)
      return res.status(400).json({ message: "vehicleId, bookingFromdate, bookingTodate required" });

    const from = new Date(bookingFromdate);
    const to = new Date(bookingTodate);

    if (isNaN(from.getTime()) || isNaN(to.getTime()))
      return res.status(400).json({ message: "Invalid dates" });

    if (from > to) return res.status(400).json({ message: "From date must be <= To date" });

    // Overlap condition:
    // existing.from <= new.to AND existing.to >= new.from
    const overlap = await Booking.findOne({
      vehicleId,
      bookingStatus: { $in: [0, 1] }, // 0 Pending, 1 Accepted (active). ignore Rejected/Cancelled
      bookingFromdate: { $lte: to },
      bookingTodate: { $gte: from },
    });

    res.json({ available: !overlap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/booking", async (req, res) => {
  try {
    const {
      userId,
      vehicleId,
      bookingFromdate,
      bookingTodate,
      bookingFromplaceId,
      bookingToplaceId,
    } = req.body;

    if (
      !userId ||
      !vehicleId ||
      !bookingFromdate ||
      !bookingTodate ||
      !bookingFromplaceId ||
      !bookingToplaceId
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(vehicleId) ||
      !mongoose.Types.ObjectId.isValid(bookingFromplaceId) ||
      !mongoose.Types.ObjectId.isValid(bookingToplaceId)
    ) {
      return res.status(400).json({ message: "Invalid ObjectId in request" });
    }

    if (bookingFromplaceId === bookingToplaceId) {
      return res.status(400).json({ message: "From place and To place cannot be same" });
    }

    const from = new Date(bookingFromdate);
    const to = new Date(bookingTodate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    if (from > to) {
      return res.status(400).json({ message: "From date must be less than or equal to To date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (from < today) {
      return res.status(400).json({ message: "From date cannot be in the past" });
    }

    const [user, vehicle, fromPlace, toPlace] = await Promise.all([
      User.findById(userId),
      Vehicle.findById(vehicleId),
      Place.findById(bookingFromplaceId),
      Place.findById(bookingToplaceId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (!fromPlace) return res.status(404).json({ message: "From place not found" });
    if (!toPlace) return res.status(404).json({ message: "To place not found" });

    const overlap = await Booking.findOne({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      bookingStatus: { $in: [0, 1] },
      bookingFromdate: { $lte: to },
      bookingTodate: { $gte: from },
    });

    if (overlap) {
      return res.status(409).json({ message: "Vehicle not available for selected dates" });
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((to - from) / msPerDay) + 1;
    const bookingAmount = Number(vehicle.vehiclePrice) * days;

    const created = await Booking.create({
      bookingAmount,
      bookingFromdate: from,
      bookingTodate: to,
      userId: new mongoose.Types.ObjectId(userId),
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      bookingStatus: 0,
      bookingFromplaceId: new mongoose.Types.ObjectId(bookingFromplaceId),
      bookingToplaceId: new mongoose.Types.ObjectId(bookingToplaceId),
    });

    return res.json({
      message: "Booking successful",
      bookingAmount,
      days,
      bookingId: created._id,
    });
  } catch (err) {
    console.log("BOOKING ERROR:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


// -------------------- USER MY BOOKINGS --------------------
app.get("/booking/user/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const data = await Booking.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingFromplaceId",
          foreignField: "_id",
          as: "fromPlace",
        },
      },
      { $unwind: { path: "$fromPlace", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingToplaceId",
          foreignField: "_id",
          as: "toPlace",
        },
      },
      { $unwind: { path: "$toPlace", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          bookingId: "$_id",
          bookingAmount: 1,
          bookingDate: 1,
          bookingFromdate: 1,
          bookingTodate: 1,
          bookingStatus: 1,

          vehicleId: 1,
          vehicleName: "$vehicle.vehicleName",
          vehiclePhoto: "$vehicle.vehiclePhoto",

          bookingFromplaceId: 1,
          bookingToplaceId: 1,
          fromPlaceName: "$fromPlace.placeName",
          toPlaceName: "$toPlace.placeName",
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- CANCEL BOOKING --------------------
app.put("/booking/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (![0, 1].includes(booking.bookingStatus))
      return res.status(400).json({ message: "Cannot cancel this booking" });

    booking.bookingStatus = 3; // Cancelled
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/booking/check", async (req, res) => {
  try {
    const { vehicleId, bookingFromdate, bookingTodate } = req.body;

    if (!vehicleId || !bookingFromdate || !bookingTodate)
      return res
        .status(400)
        .json({ message: "vehicleId, bookingFromdate, bookingTodate required" });

    if (!isValidObjectId(vehicleId))
      return res.status(400).json({ message: "Invalid vehicleId" });

    const from = normalizeDateOnly(bookingFromdate);
    const to = normalizeDateOnly(bookingTodate);

    if (isNaN(from.getTime()) || isNaN(to.getTime()))
      return res.status(400).json({ message: "Invalid dates" });

    if (from > to)
      return res.status(400).json({ message: "From date must be <= To date" });

    // Past date block (optional but recommended)
    const today = normalizeDateOnly(new Date());
    if (from < today)
      return res.status(400).json({ message: "From date cannot be in the past" });

    // Ensure vehicle exists
    const v = await Vehicle.findById(vehicleId);
    if (!v) return res.status(404).json({ message: "Vehicle not found" });

    // Overlap check (Pending/Accepted block)
    const overlap = await Booking.findOne({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      bookingStatus: { $in: [0, 1] },
      bookingFromdate: { $lte: to },
      bookingTodate: { $gte: from },
    });

    return res.json({ available: !overlap });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




/* -------------------- ASSIGN -------------------- */
const assignSchema = new mongoose.Schema(
  {
    assignDate: { type: Date, default: Date.now },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },

    assignStatus: {
      type: Number,
      enum: [0, 1, 2], // 0: Pending, 1: Accepted, 2: Rejected
      default: 0,
    },
  },
  { collection: "assignments", timestamps: true }
);
const Assign = mongoose.model("Assign", assignSchema);

app.get("/manager/staff/:managerId", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.managerId)) {
      return res.status(400).json({ message: "Invalid manager id" });
    }

    const manager = await Manager.findById(req.params.managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const data = await Staff.aggregate([
      {
        $match: {
          placeId: new mongoose.Types.ObjectId(manager.placeId),
        },
      },
      { $sort: { staffName: 1 } },

      {
        $lookup: {
          from: "stafftypes",
          localField: "stafftypeId",
          foreignField: "_id",
          as: "stafftype",
        },
      },
      { $unwind: { path: "$stafftype", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          staffId: "$_id",
          staffName: 1,
          staffEmail: 1,
          staffContact: 1,
          staffAddress: 1,
          staffPhoto: 1,
          placeId: 1,
          stafftypeId: 1,
          stafftypeName: "$stafftype.stafftypeName",
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/manager/booking/:bookingId", async (req, res) => {
  try {
    console.log("bookingId:", req.params.bookingId);

    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const data = await Booking.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.bookingId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingFromplaceId",
          foreignField: "_id",
          as: "fromPlace",
        },
      },
      { $unwind: { path: "$fromPlace", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "places",
          localField: "bookingToplaceId",
          foreignField: "_id",
          as: "toPlace",
        },
      },
      { $unwind: { path: "$toPlace", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          bookingId: "$_id",
          bookingAmount: 1,
          bookingDate: 1,
          bookingFromdate: 1,
          bookingTodate: 1,
          bookingStatus: 1,

          userId: 1,
          userName: "$user.userName",
          userEmail: "$user.userEmail",
          userContact: "$user.userContact",

          vehicleId: 1,
          vehicleName: "$vehicle.vehicleName",
          vehiclePhoto: "$vehicle.vehiclePhoto",

          bookingFromplaceId: 1,
          bookingToplaceId: 1,
          fromPlaceName: "$fromPlace.placeName",
          toPlaceName: "$toPlace.placeName",

          _id: 0,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(data[0]);
  } catch (err) {
    console.log("MANAGER BOOKING DETAILS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.get("/manager/staff/:managerId", async (req, res) => {
  try {
    console.log("managerId:", req.params.managerId);

    if (!mongoose.Types.ObjectId.isValid(req.params.managerId)) {
      return res.status(400).json({ message: "Invalid manager id" });
    }

    const manager = await Manager.findById(req.params.managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const data = await Staff.aggregate([
      {
        $match: {
          placeId: manager.placeId,
        },
      },
      { $sort: { staffName: 1 } },

      {
        $lookup: {
          from: "stafftypes",
          localField: "stafftypeId",
          foreignField: "_id",
          as: "stafftype",
        },
      },
      { $unwind: { path: "$stafftype", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          staffId: "$_id",
          staffName: 1,
          staffEmail: 1,
          staffContact: 1,
          staffAddress: 1,
          staffPhoto: 1,
          placeId: 1,
          stafftypeId: 1,
          stafftypeName: "$stafftype.stafftypeName",
          _id: 0,
        },
      },
    ]);

    return res.json({ data });
  } catch (err) {
    console.log("MANAGER STAFF ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------- MANAGER: ASSIGN STAFF TO BOOKING --------------------
app.post("/manager/assign", async (req, res) => {
  try {
    const { bookingId, staffId } = req.body;

    if (!bookingId || !staffId) {
      return res.status(400).json({ message: "bookingId and staffId required" });
    }

    if (!isValidObjectId(bookingId) || !isValidObjectId(staffId)) {
      return res.status(400).json({ message: "Invalid bookingId or staffId" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // booking must be accepted before assign
    if (booking.bookingStatus !== 1) {
      return res.status(400).json({ message: "Only accepted booking can be assigned" });
    }

    // staff place must match booking manager place side
    const placeMatch =
      String(staff.placeId) === String(booking.bookingFromplaceId) ||
      String(staff.placeId) === String(booking.bookingToplaceId);

    if (!placeMatch) {
      return res.status(400).json({ message: "Staff place does not match booking place" });
    }

    // prevent duplicate assignment for same booking
    const alreadyAssigned = await Assign.findOne({ bookingId });
    if (alreadyAssigned) {
      return res.status(409).json({ message: "Staff already assigned to this booking" });
    }

    const created = await Assign.create({
      bookingId,
      staffId,
      assignStatus: 0,
    });

    res.json({
      message: "Staff Assigned Successfully",
      assignId: created._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// -------------------- MANAGER: VIEW ASSIGNMENTS --------------------
app.get("/manager/assignments/:placeId", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.placeId)) {
      return res.status(400).json({ message: "Invalid place id" });
    }

    const placeId = new mongoose.Types.ObjectId(req.params.placeId);

    const data = await Assign.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: false } },

      {
        $match: {
          $or: [
            { "booking.bookingFromplaceId": placeId },
            { "booking.bookingToplaceId": placeId },
          ],
        },
      },

      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "users",
          localField: "booking.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "vehicles",
          localField: "booking.vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      { $sort: { createdAt: -1 } },

      {
        $project: {
          assignId: "$_id",
          assignDate: 1,
          assignStatus: 1,

          bookingId: "$booking._id",
          bookingAmount: "$booking.bookingAmount",
          bookingFromdate: "$booking.bookingFromdate",
          bookingTodate: "$booking.bookingTodate",
          bookingStatus: "$booking.bookingStatus",

          userName: "$user.userName",
          vehicleName: "$vehicle.vehicleName",

          staffId: "$staff._id",
          staffName: "$staff.staffName",
          staffEmail: "$staff.staffEmail",
          staffContact: "$staff.staffContact",
          staffPhoto: "$staff.staffPhoto",

          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- FEEDBACK -------------------- */
const feedbackSchema = new mongoose.Schema(
  {
    feedbackContent: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "feedbacks", timestamps: true }
);
const Feedback = mongoose.model("Feedback", feedbackSchema);


/* -------------------- FEEDBACK API -------------------- */

// INSERT FEEDBACK
app.post("/feedback", async (req, res) => {
  try {
    const feedbackContent = (req.body.feedbackContent || "").trim();
    const userId = req.body.userId;

    if (!feedbackContent) {
      return res.status(400).json({ message: "feedbackContent required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    await Feedback.create({ feedbackContent, userId });

    res.json({ message: "Feedback Added Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL FEEDBACKS
app.get("/feedback", async (req, res) => {
  try {
    const data = await Feedback.aggregate([
      {
        $lookup: {
          from: "users", // collection name of User model
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          feedbackId: "$_id",
          feedbackContent: 1,
          userId: 1,
          userName: "$userDetails.userName", // change if your field name is different
          createdAt: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE FEEDBACK
app.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- COMPLAINT -------------------- */

const complaintSchema = new mongoose.Schema(
  {
    complaintTitle: { type: String, required: true, trim: true },
    complaintContent: { type: String, required: true, trim: true },
    complaintDate: { type: Date, default: Date.now },

    complaintReply: { type: String, default: "Pending" },
    complaintStatus: { type: String, default: "Pending" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "complaints", timestamps: true }
);
const Complaint = mongoose.model("Complaint", complaintSchema);


/* -------------------- COMPLAINT API -------------------- */

// INSERT COMPLAINT
app.post("/complaint", async (req, res) => {
  try {
    const complaintTitle = (req.body.complaintTitle || "").trim();
    const complaintContent = (req.body.complaintContent || "").trim();
    const userId = req.body.userId;

    if (!complaintTitle) {
      return res.status(400).json({ message: "complaintTitle required" });
    }

    if (!complaintContent) {
      return res.status(400).json({ message: "complaintContent required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    await Complaint.create({
      complaintTitle,
      complaintContent,
      userId,
    });

    res.json({ message: "Complaint Added Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL COMPLAINTS
app.get("/complaint", async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $lookup: {
          from: "users", // change if your user collection name is different
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          complaintId: "$_id",
          complaintTitle: 1,
          complaintContent: 1,
          complaintDate: 1,
          complaintReply: 1,
          complaintStatus: 1,
          userId: 1,
          userName: "$userDetails.userName", // change field if needed
          createdAt: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE COMPLAINT
app.delete("/complaint/:id", async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- ADMIN COMPLAINT API -------------------- */

// GET ALL COMPLAINTS
app.get("/admin/complaint", async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          complaintId: "$_id",
          complaintTitle: 1,
          complaintContent: 1,
          complaintDate: 1,
          complaintReply: 1,
          complaintStatus: 1,
          userId: 1,
          userName: "$userDetails.userName", // change if needed
          userEmail: "$userDetails.userEmail", // change if needed
          createdAt: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REPLY / UPDATE COMPLAINT
app.put("/admin/complaint/:id/reply", async (req, res) => {
  try {
    const complaintReply = (req.body.complaintReply || "").trim();

    if (!complaintReply) {
      return res.status(400).json({ message: "complaintReply required" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        complaintReply,
        complaintStatus: "Replied",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Reply Added Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE COMPLAINT
app.delete("/admin/complaint/:id", async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- LOGIN (USER / ADMIN / STAFF / MANAGER) --------------------
app.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // 1) ADMIN
    const admin = await Admin.findOne({ adminEmail: email, adminPassword: password });
    if (admin) {
      return res.json({
        role: "admin",
        id: admin._id,
        name: admin.adminName,
        message: "Login successful",
      });
    }

    // 2) MANAGER
    const manager = await Manager.findOne({ managerEmail: email, managerPassword: password });
    if (manager) {
      return res.json({
        role: "manager",
        id: manager._id,
        name: manager.managerName,
        message: "Login successful",
        placeId: manager.placeId,
      });
    }

    // 3) STAFF
    const staff = await Staff.findOne({ staffEmail: email, staffPassword: password });
    if (staff) {
      return res.json({
        role: "staff",
        id: staff._id,
        name: staff.staffName,
        message: "Login successful",
        placeId: staff.placeId,
        stafftypeId: staff.stafftypeId,
      });
    }

    // 4) USER
    const user = await User.findOne({ userEmail: email, userPassword: password });
    if (user) {
      return res.json({
        role: "user",
        id: user._id,
        name: user.userName,
        message: "Login successful",
        placeId: user.placeId,
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});





// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});