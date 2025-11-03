import { fileURLToPath } from 'url';

import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import cloudinary from './cloudinary.js';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

import {
    sql,
    getPool,

    getOrCreateCompany,
    upsertProperty,
    replaceChildArrays,
    // insertMany,
    // insertNearbySchools,

    addUserToDB,
    getUserByEmail,
    findUserId,
    checkPassword,
    setCode,
    compareCode,
    changePassword,
    findPropertyById,
    getSavedProperties,
    findAllProperties,
    toggleSaved,
    getAgentProperties,
    getAllUsers,
    getAllAgents,
    getAllProperties,
    updatePropertyPublished,
    // insertProperty,
    insertPropertyWithImages,
} from './db.js';
import { uploadImage } from './uploadImage.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /^image\/(png|jpe?g|webp|gif|bmp|svg\+xml)$/i.test(file.mimetype);
        cb(ok ? null : new Error("Only image files are allowed"), ok);
    },
});

function uploadBufferToCloudinary(buffer, filename, folder = "nestnova/properties") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                use_filename: true,
                filename_override: filename?.replace(/\.[^/.]+$/, "")?.slice(0, 100) || undefined,
                // Optional transform to limit huge files:
                // transformation: [{ width: 2000, height: 2000, crop: "limit" }],
            },
            (err, res) => (err ? reject(err) : resolve(res))
        );
        stream.end(buffer);
    });
}

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));

app.use(cookieParser());


async function processMail(to, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `NestNova <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Reset code sent.' };
    } catch (err) {
        console.error('Email sending error:', err?.response || err);
        return {
            success: false,
            message: 'Email failed to send. Please try again.',
            error: err?.message,
        };
    }
}


app.get("/", (req, res) => {
    res.send("Backend is running 🚀 | Try GET /api/healthz");
});

app.get("/api/healthz", (req, res) => res.json({ ok: true }));


app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            console.log("Email found")
            return res.status(404).json({ message: 'Email Not Registered.' });
        }
        console.log("Passed Email exists");

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const forgotPass = await setCode(email, code, 'forgot', 15);

        if (!forgotPass || !forgotPass.success) {

            return res.status(500).json({ message: 'Failed to generate reset code.' });
        }

        const subject = "Your Password Reset Code";

        const message = `
        <h2>Password Reset Request</h2>
        <p>Your password reset code is:</p>
        <h1 style="color:#1a73e8;">${code}</h1>
        <p>This code will expire in 15 minutes. If you didn’t request this, please ignore it.</p>
        <p>— NestNova Team</p>
        `;

        const mailSent = await processMail(email, subject, message);
        if (!mailSent.success) {
            return res.status(500).json({ message: "Failed to send. " })
        }

        res.status(200).json({ message: 'Reset code sent successfully.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT otpCode, otpExpiry FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        const user = result.recordset[0];
        if (!user.otpCode || !user.otpExpiry) {
            return res.status(400).json({ message: 'No reset code found. Please request a new one.' });
        }

        const now = new Date();
        const expiry = new Date(user.reset_code_expiry);
        const compare = await compareCode(otp, user.otpCode);

        if (!compare.success) {
            return res.status(400).json({ message: compare.message || 'Invalid Message' })
        }

        if (now > expiry) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        res.status(200).json({ message: 'OTP verified successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});


app.post('/api/setPassword', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Changing Password for :", email);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await changePassword(email, password);
        if (!result?.success) {
            return res.status(500).json({ message: result?.message || 'Failed to change password' });
        }

        const userResult = await getUserByEmail(email, password);
        if (!userResult?.success || !userResult?.user) {
            return res.status(401).json({ message: userResult?.message || 'Invalid email or password' });
        }

        const userDet = userResult.user;

        res.cookie("userSession", JSON.stringify(userDet), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('setPassword error:', err);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Server error' });
        }
    }
});

app.post("/api/compareAndSetPassword", async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "Email, current, and new password are required" });
        }

        const userResult = await getUserByEmail(email, currentPassword);
        if (!userResult?.success || !userResult?.user) {
            return res.status(404).json({ message: "Incorrect Password" });
        }

        const updateResult = await changePassword(email, newPassword);

        if (!updateResult?.success) {
            return res.status(500).json({ message: "Failed to update password" });
        }
        const userDet = userResult.user;
        res.cookie("userSession", JSON.stringify(userDet), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("compareAndSetPassword error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error" });
        }
    }
});



app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    console.log("Checking registration data:", email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await addUserToDB(email, password);


    const userResult = await getUserByEmail(email, password);


    if (!userResult || !userResult.success) {
        return res.status(401).json({ message: userResult.message || 'Invalid email or password' });
    }
    const userDet = userResult.user;

    res.cookie("userSession", JSON.stringify(userDet), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });


    if (result.success) {
        res.status(200).json({ message: 'User registered successfully', });
    } else {
        res.status(500).json({ message: result.message || 'Failed to register user' });
    }


});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("Checking login data:", email);
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const userResult = await getUserByEmail(email, password);
        if (!userResult || !userResult.success) {
            return res.status(401).json({ message: userResult.message || 'Invalid email or password' });
        }
        const userDet = userResult.user;

        // console.log("User found:", userDet);

        res.cookie("userSession", JSON.stringify(userDet), {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(200).json({
            message: 'Login successful',
            role: userDet.role,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

function requireAuth() {
    return (req, res, next) => {
        const userSession = req.cookies.userSession;
        if (!userSession) {
            console.log("No user session found");
            return res.status(401).json({ message: 'Not logged in' });
        }

        try {
            const parsed = JSON.parse(userSession);
            // console.log("✅ Cookie parsed:", parsed);
            req.session = parsed;
            next();
        }
        catch (err) {
            console.error("❌ Error parsing cookie:", err.message);
            return res.status(400).json({ message: 'Invalid session data' });
        }

    }
}

app.get('/api/checkStatus', requireAuth(), async (req, res) => {
    try {
        if (!req.session || !req.session.id) {
            return res.json({ user: null });
        }

        const userResult = await findUserId(req.session.id);
        if (!userResult) {
            return res.json({ user: null });
        }

        res.json({ user: userResult });
    } catch (err) {
        console.error("Error in checkStatus route:", err);
        res.json({ user: null });
    }
});



app.get('/api/user/setting', requireAuth(), async (req, res) => {
    try {
        const user = await findUserId(req.session.id);
        if (!user) {
            return res.status(401).json({ message: 'Error Retrieving' });
        }
        res.json({
            emailInput: user.email,
            userNameInput: user.name,
            phoneInput: user.phone,
            profilePic: user.profile_pic,
            companyNameInput: user.company_name,
            orgTypeInput: user.institution_type,
            addressInput: user.address,
            cityInput: user.city,
            stateInput: user.state,
            bioInput: user.description
        });
    } catch (err) {
        console.error("Error in dashboard route:", err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/checkPassword', requireAuth(), async (req, res) => {
    try {
        const { password } = req.body;
        const user = await findUserId(req.session.id);

        if (!user) {
            return res.status(401).json({ message: 'Error Retrieving' });
        }

        const email = user.email;
        const checkResult = await checkPassword(user.email, password);

        if (!checkResult.success) {
            return res.status(400).json({ success: false, message: checkResult.message });
        }
        res.status(200).json({ success: true, message: 'Password is correct' });
    } catch (err) {
        console.error('Error checking password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/logout', async (req, res) => {
    res.clearCookie('userSession');
    res.redirect('/');
})

function safeParseJson(maybeJson) {
    try {
        const first = typeof maybeJson === "string" ? JSON.parse(maybeJson) : maybeJson;
        if (typeof first === "string") return JSON.parse(first);
        return first;
    } catch {
        return null;
    }
}


app.get("/api/properties", async (req, res) => {
    try {
        const allProp = await findAllProperties();

        const properties = allProp.map((home) => {
            let images = [];
            try {
                images = JSON.parse(home.ImagesJson || "[]");
                if (!Array.isArray(images)) images = [];
            } catch {
                images = [];
            }

            const { ImagesJson, ...rest } = home;
            return { ...rest, images };
        });

        return res.json({ properties });
    } catch (err) {
        console.error("Error in /api/properties:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
});



app.get("/api/properties/:id", async (req, res) => {
    try {
        const rawId = String(req.params.id || "").trim();
        if (!/^\d+$/.test(rawId)) {
            return res.status(400).json({ message: "Invalid property id." });
        }

        const id = Number(rawId);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid property id." });
        }

        const home = await findPropertyById(id);
        if (!home) return res.status(404).json({ message: "Property not found." });

        const images = safeParseJson(home.images, []);
        const agent = safeParseJson(home.agent, null);

        const { images: _img, agent: _ag, ...rest } = home;

        const property = {
            ...rest,
            images: Array.isArray(images) ? images : [],
            agent: agent && typeof agent === "object" ? agent : null,
        };

        res.set("Cache-Control", "private, max-age=60");

        return res.json({ property });
    } catch (err) {
        console.error("Error in GET /api/properties/:id:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
});

app.get('/api/getSaved', requireAuth(), async (req, res) => {
    console.log("Fetching saved properties for user:", req.session);
    try {
        const userId = req.session?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated.' });

        const savedProperties = await getSavedProperties(userId);
        res.status(200).json({ saved: savedProperties });
    } catch (err) {
        console.error('Error fetching saved properties:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/api/saved', requireAuth(), async (req, res) => {
    try {
        const raw = req.body?.propertyId;
        if (!raw || !/^\d+$/.test(String(raw))) {
            return res.status(400).json({ message: 'Valid propertyId is required.' });
        }
        const propertyId = parseInt(raw, 10);

        const userId = req.session?.id;
        if (!userId) return res.status(401).json({ message: 'Not authenticated.' });

        const toggle = await toggleSaved(userId, propertyId);
        if (!toggle.success) {
            return res.status(500).json({ message: toggle.message || 'Failed to toggle saved property.' });
        }

        return res.status(200).json({ success: true, action: toggle.action });
    } catch (err) {
        console.error('Error saving property:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post("/api/profile/upload", upload.single("file"), async (req, res) => {
    console.log("LO")
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const imageUrl = await uploadImage(req.file.buffer, "profile_pictures");
        return res.json({ url: imageUrl });
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Upload failed" });
    }
});

app.post("/api/uploads/images", upload.array("files", 15), async (req, res) => {
    try {
        if (!req.files?.length) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const results = await Promise.all(
            req.files.map((f) =>
                uploadBufferToCloudinary(f.buffer, f.originalname).then((r) => ({
                    url: r.secure_url,
                    public_id: r.public_id,
                    width: r.width,
                    height: r.height,
                    bytes: r.bytes,
                    format: r.format,
                }))
            )
        );

        res.json({ files: results, message: "Uploaded successfully" });
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ message: "Upload failed" });
    }
});

app.patch("/api/me", async (req, res) => {
    const { id, name, phone_number, location, profileUrl } = req.body;
    const pool = await getPool();
    try {
        const request = pool.request()
            .input("userId", sql.VarChar, String(id))
            .input("name", sql.VarChar(200), name || null)
            .input("phone_number", sql.VarChar(50), phone_number || null)
            .input("location", sql.VarChar(200), location || null)
            .input("profileUrl", sql.VarChar(400), profileUrl || null);

        const result = await request.query(`
      UPDATE dbo.Users
      SET
        name = ISNULL(@name, name),
        phone_number = ISNULL(@phone_number, phone_number),
        location = ISNULL(@location, location),
        profileUrl = ISNULL(@profileUrl, profileUrl)
      WHERE userId = @userId;

      SELECT TOP 1 userId, email, name, phone_number, location, profileUrl
      FROM dbo.Users
      WHERE userId = @userId;
    `);

        if (!result.recordset.length)
            return res.status(404).json({ message: "User not found" });

        res.json({
            message: "Profile updated successfully",
            user: result.recordset[0],
        });
    } catch (err) {
        console.error("PATCH /api/me error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/api/agentDetails', requireAuth(), async (req, res) => {
    try {
        const user = await findUserId(req.session.id);
        const userId = user.userId;

        if (!userId) return res.status(401).json({ message: 'Not authenticated.' });

        const data = await getAgentProperties(userId);
        // console.log('Agent Data:', data);
        res.status(200).json(data);

    } catch (err) {
        console.error('AgentDetails error:', err);
        res.status(500).json({ error: 'Failed to load agent details' });
    }
});

app.patch("/api/properties/:id/approve", requireAuth(), async (req, res) => {
    try {
        const rawId = String(req.params.id || "").trim();
        if (!/^\d+$/.test(rawId)) return res.status(400).json({ message: "Invalid property id." });
        const id = parseInt(rawId, 10);

        const approved = req.body?.approved === true || req.body?.approved === 1 ? 1 : 0;

        const pool = await getPool();
        await pool.request()
            .input("pid", sql.Int, id)
            .input("approved", sql.Bit, approved)
            .query(`
        IF EXISTS (SELECT 1 FROM dbo.Approvals WHERE property_id = @pid)
        BEGIN
          UPDATE dbo.Approvals
          SET agentApproved = @approved
          WHERE property_id = @pid;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.Approvals (property_id, agentApproved)
          VALUES (@pid, @approved);
        END
      `);

        return res.json({ ok: true, property_id: id, agentApproved: approved });
    } catch (err) {
        console.error("PATCH /api/properties/:id/approve error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
});




app.post('/api/import/properties', async (req, res) => {
    const data = Array.isArray(req.body) ? req.body : [];
    if (data.length === 0) return res.status(400).json({ error: 'Body must be a non-empty array.' });

    const pool = await getPool();

    const results = [];
    for (const item of data) {
        const tx = new sql.Transaction(pool);
        try {
            await tx.begin();

            const companyId = await getOrCreateCompany(tx, item.company);
            const propertyId = await upsertProperty(tx, item, companyId, true);

            await replaceChildArrays(tx, propertyId, item);

            await tx.commit();
            results.push({ external_id: item.basic?.id, property_id: propertyId, status: 'upserted' });
        } catch (err) {
            try { await tx.rollback(); } catch { }
            results.push({ external_id: item.basic?.id, error: err.message });
        }
    }

    return res.json({ count: results.length, results });
});


app.get("/api/admin/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        console.error("Admin users error:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

app.get("/api/admin/agents", async (req, res) => {
    try {
        const agents = await getAllAgents();
        res.json(agents);
    } catch (err) {
        console.error("Admin agents error:", err);
        res.status(500).json({ message: "Failed to fetch agents" });
    }
});

app.post("/api/add/properties", requireAuth(), async (req, res) => {
    const {
        agentId,
        property_type,
        home_type,
        status,
        price,
        bedrooms,
        bathrooms,
        sqft,

        street,
        city,
        zip_code,
        latitude,
        longitude,

        year_built,
        acres,
        parking_spaces,

        main_image,
        hoa_has,
        hoa_fee,
        electric,
        sewer,
        water,

        is_demo,

        images = [],
    } = req.body || {};

    if (!agentId) return res.status(400).json({ error: "agentId is required" });
    if (!property_type || !home_type || !status) {
        return res.status(400).json({ error: "property_type, home_type, status are required" });
    }
    if (price == null || bedrooms == null || bathrooms == null || sqft == null) {
        return res.status(400).json({ error: "price, bedrooms, bathrooms, sqft are required" });
    }
    if (!street || !zip_code || !city) {
        return res.status(400).json({ error: "city, street, zip_code are required" });
    }

    const payload = {
        agentId,
        property_type, home_type, status,
        price, bedrooms, bathrooms, sqft,
        city,
        street, zip_code,
        latitude, longitude,
        year_built, acres, parking_spaces,
        main_image: main_image || (Array.isArray(images) && images[0]?.url) || null,
        hoa_has: !!hoa_has,
        hoa_fee,
        electric, sewer, water,
        is_demo: !!is_demo,
    };

    const galleryUrls = (Array.isArray(images) ? images : [])
        .map((x) => (typeof x === "string" ? x : x?.url))
        .filter(Boolean);

    try {
        const created = await insertPropertyWithImages(payload, galleryUrls);
        res.status(201).json(created);
    } catch (err) {
        console.error("Create property error:", err);
        res.status(500).json({ error: "Failed to create property" });
    }
});


app.get('/api/admin/properties', async (req, res) => {
    try {
        const properties = await getAllProperties();
        res.json(properties);
    } catch (err) {
        console.error("Properties error:", err);
        res.status(500).json({ message: "Failed to fetch Properties" });
    }

});

app.patch(
    "/api/admin/properties/:propertyId/published",
    requireAuth(),
    async (req, res) => {
        try {
            const propertyId = Number(req.params.propertyId);
            const { published } = req.body;

            if (!Number.isFinite(propertyId)) {
                return res.status(400).json({ error: "Invalid propertyId" });
            }

            if (typeof published !== "boolean") {
                return res.status(400).json({ error: "published must be boolean" });
            }

            const updated = await updatePropertyPublished(propertyId, published);
            if (!updated) {
                return res.status(404).json({ error: "Property not found" });
            }

            return res.json(updated);
        } catch (err) {
            console.error("❌ Error toggling property published:", err);
            res.status(500).json({ error: "Failed to update property publish state" });
        }
    }
);

const clamp = (s = "", max = 150) => (typeof s === "string" ? s.trim().slice(0, max) : null);
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(String(e || "").trim());

app.post("/api/contact", async (req, res) => {
    try {
        const {
            purpose = "",
            persona = "",
            name = "",
            email = "",
            org = "",
            phone = "",
            message = "",
        } = req.body || {};

        if (!name.trim() || !email.trim() || !message.trim()) {
            return res.status(400).json({ error: "Name, email, and message are required." });
        }

        const pool = await getPool();
        const request = pool.request();

        request.input("purpose", sql.NVarChar(100), purpose || null);
        request.input("persona", sql.NVarChar(100), persona || null);
        request.input("name", sql.NVarChar(150), name.trim());
        request.input("email", sql.NVarChar(150), email.trim());
        request.input("org", sql.NVarChar(150), org || null);
        request.input("phone", sql.NVarChar(50), phone || null);
        request.input("message", sql.NVarChar(sql.MAX), message.trim());

        const result = await request.query(`
      INSERT INTO dbo.ContactMessages
        (purpose, persona, name, email, org, phone, message, created_at)
      OUTPUT INSERTED.id, INSERTED.created_at
      VALUES (@purpose, @persona, @name, @email, @org, @phone, @message, SYSDATETIME());
    `);

        const inserted = result.recordset?.[0];

        const adminEmail = "nestnova09@gmail.com";
        const subject = `📬 New Contact Message from ${name}`;
        const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2 style="color:#0d9488;">New Contact Message</h2>
        <p><b>Purpose:</b> ${purpose || "N/A"}</p>
        <p><b>Persona:</b> ${persona || "N/A"}</p>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Organization:</b> ${org || "N/A"}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Message:</b></p>
        <blockquote style="border-left:3px solid #0d9488;padding-left:1em;color:#333;">
          ${message.replace(/\n/g, "<br/>")}
        </blockquote>
        <hr>
        <p style="font-size:0.9em;color:#666;">Sent via NestNova Contact Form</p>
      </div>
    `;

        await processMail(adminEmail, subject, htmlMessage);

        return res.status(201).json({
            ok: true,
            id: inserted?.id,
            created_at: inserted?.created_at,
            message: "Message sent successfully!",
        });
    } catch (err) {
        console.error("❌ Contact API error:", err);
        return res.status(500).json({ error: "Failed to submit message." });
    }
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


