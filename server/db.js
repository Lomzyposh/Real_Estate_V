import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;
const saltRounds = 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err);
});

export async function getPool() {
  return pool;
}

process.on("SIGINT", async () => {
  try {
    await pool.end();
  } catch {}
  process.exit(0);
});

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toStrOrNull = (v) => {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
};

const toBoolOrNull = (v) => {
  if (v === null || v === undefined) return null;
  return !!v;
};

function safeParseJson(value, fallback) {
  try {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch {
    return fallback;
  }
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    userId: row.userid,
    email: row.email,
    role: row.role,
    name: row.name,
    phone_number: row.phone_number,
    profileUrl: row.profileurl,
    coverUrl: row.coverurl,
    location: row.location,
    isActive: row.isactive,
    lastLogin: row.lastlogin,
    createdAt: row.createdat,
  };
}

export async function getOrCreateCompany(client, company) {
  if (!company || !company.name) return null;

  const found = await client.query(
    `SELECT company_id FROM companies WHERE name = $1 LIMIT 1`,
    [company.name],
  );

  if (found.rows.length) {
    return found.rows[0].company_id;
  }

  const inserted = await client.query(
    `
      INSERT INTO companies (name, logo_img, address)
      VALUES ($1, $2, $3)
      RETURNING company_id
    `,
    [company.name, company.logoImg || null, company.address || null],
  );

  return inserted.rows[0].company_id;
}

export async function upsertProperty(client, item, companyId, isDemo = false) {
  const { agentId } = item;
  const b = item.basic || {};
  const loc = item.location || {};
  const media = item.media || {};
  const feat = item.features || {};
  const util = item.utility || {};
  const hoa = (item.community && item.community.hoa) || {};
  const climate = item.climateFactors || {};

  const result = await client.query(
    `
      INSERT INTO properties (
        external_id,
        agentid,
        property_type,
        home_type,
        status,
        year_built,
        price,
        sqft,
        acres,
        floor_count,
        floor_level,
        bedrooms,
        bathrooms,
        parking_spaces,
        latitude,
        longitude,
        city,
        zip_code,
        street,
        main_image,
        more_text,
        company_id,
        has_garage,
        has_pool,
        has_garden,
        electric,
        sewer,
        water,
        hoa_has,
        hoa_fee,
        flood_factor,
        fire_factor,
        wind_factor,
        air_factor,
        heat_factor,
        is_demo
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,
        $27,$28,$29,$30,$31,$32,$33,$34,$35,$36
      )
      ON CONFLICT (external_id)
      DO UPDATE SET
        agentid = EXCLUDED.agentid,
        property_type = EXCLUDED.property_type,
        home_type = EXCLUDED.home_type,
        status = EXCLUDED.status,
        year_built = EXCLUDED.year_built,
        price = EXCLUDED.price,
        sqft = EXCLUDED.sqft,
        acres = EXCLUDED.acres,
        floor_count = EXCLUDED.floor_count,
        floor_level = EXCLUDED.floor_level,
        bedrooms = EXCLUDED.bedrooms,
        bathrooms = EXCLUDED.bathrooms,
        parking_spaces = EXCLUDED.parking_spaces,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        city = EXCLUDED.city,
        zip_code = EXCLUDED.zip_code,
        street = EXCLUDED.street,
        main_image = EXCLUDED.main_image,
        more_text = EXCLUDED.more_text,
        company_id = EXCLUDED.company_id,
        has_garage = EXCLUDED.has_garage,
        has_pool = EXCLUDED.has_pool,
        has_garden = EXCLUDED.has_garden,
        electric = EXCLUDED.electric,
        sewer = EXCLUDED.sewer,
        water = EXCLUDED.water,
        hoa_has = EXCLUDED.hoa_has,
        hoa_fee = EXCLUDED.hoa_fee,
        flood_factor = EXCLUDED.flood_factor,
        fire_factor = EXCLUDED.fire_factor,
        wind_factor = EXCLUDED.wind_factor,
        air_factor = EXCLUDED.air_factor,
        heat_factor = EXCLUDED.heat_factor,
        is_demo = EXCLUDED.is_demo
      RETURNING property_id
    `,
    [
      toNum(b.id),
      toStrOrNull(agentId),
      toStrOrNull(b.propertyType),
      toStrOrNull(b.homeType),
      toStrOrNull(b.status),
      toNum(b.yearBuilt),
      toNum(b.price),
      toNum(b.sqrFt),
      toNum(b.acres),
      toNum(b.floorCount),
      toNum(b.floorLevel),
      toNum(b.bedroom),
      toNum(b.bathroom),
      toNum(b.parkingSpaces),
      toNum(loc.latitude),
      toNum(loc.longitude),
      toStrOrNull(loc.city),
      toStrOrNull(loc.ZipCode),
      toStrOrNull(loc.street),
      toStrOrNull(media.mainImage),
      toStrOrNull(media.moreTextAboutThePlace),
      companyId ?? null,
      toBoolOrNull(feat.hasGarage),
      toBoolOrNull(feat.hasPool),
      toBoolOrNull(feat.hasGarden),
      toStrOrNull(util.electric),
      toStrOrNull(util.sewer),
      toStrOrNull(util.water),
      toBoolOrNull(hoa.hasHOA),
      toNum(hoa.fee),
      toNum(climate.floodFactor),
      toNum(climate.fireFactor),
      toNum(climate.windFactor),
      toNum(climate.airFactor),
      toNum(climate.heatFactor),
      !!isDemo,
    ],
  );

  return result.rows[0].property_id;
}

export async function replaceChildArrays(client, propertyId, item) {
  await client.query(
    `DELETE FROM propertygalleryimages WHERE property_id = $1`,
    [propertyId],
  );
  await client.query(
    `DELETE FROM propertyparkfeatures WHERE property_id = $1`,
    [propertyId],
  );
  await client.query(`DELETE FROM propertyspecials WHERE property_id = $1`, [
    propertyId,
  ]);
  await client.query(`DELETE FROM propertyrooms WHERE property_id = $1`, [
    propertyId,
  ]);
  await client.query(
    `DELETE FROM propertykitchenfeatures WHERE property_id = $1`,
    [propertyId],
  );
  await client.query(
    `DELETE FROM propertycommunityfeatures WHERE property_id = $1`,
    [propertyId],
  );
  await client.query(`DELETE FROM nearbyschools WHERE property_id = $1`, [
    propertyId,
  ]);

  const agentApproved =
    (item?.approvals?.adminApproved ?? item?.adminApproved ?? 0) ? true : false;

  await client.query(
    `
      INSERT INTO approvals (property_id, agentapproved)
      VALUES ($1, $2)
      ON CONFLICT (property_id)
      DO UPDATE SET agentapproved = EXCLUDED.agentapproved
    `,
    [propertyId, agentApproved],
  );

  const images = item.media?.galleryImages || [];
  const parks = item.features?.parkFeatures || [];
  const specials = item.special || [];
  const rooms = item.interior?.rooms || [];
  const kitchen = item.interior?.kitchen?.features || [];
  const comm = item.community?.features || [];
  const schools = item.nearbySchools || [];

  await insertMany(client, "propertygalleryimages", "url", images, propertyId);
  await insertMany(
    client,
    "propertyparkfeatures",
    "feature",
    parks,
    propertyId,
  );
  await insertMany(client, "propertyspecials", "item", specials, propertyId);
  await insertMany(client, "propertyrooms", "room_name", rooms, propertyId);
  await insertMany(
    client,
    "propertykitchenfeatures",
    "feature",
    kitchen,
    propertyId,
  );
  await insertMany(
    client,
    "propertycommunityfeatures",
    "feature",
    comm,
    propertyId,
  );
  await insertNearbySchools(client, schools, propertyId);
}

export async function insertMany(client, table, column, rows, propertyId) {
  const allowed = {
    propertygalleryimages: "url",
    propertyparkfeatures: "feature",
    propertyspecials: "item",
    propertyrooms: "room_name",
    propertykitchenfeatures: "feature",
    propertycommunityfeatures: "feature",
  };

  if (!Array.isArray(rows) || rows.length === 0) return;
  if (!allowed[table] || allowed[table] !== column) {
    throw new Error(`Invalid table/column for insertMany: ${table}.${column}`);
  }

  for (const val of rows) {
    await client.query(
      `INSERT INTO ${table} (property_id, ${column}) VALUES ($1, $2)`,
      [propertyId, val],
    );
  }
}

export async function insertNearbySchools(client, schools, propertyId) {
  if (!Array.isArray(schools) || schools.length === 0) return;

  for (const s of schools) {
    await client.query(
      `
        INSERT INTO nearbyschools (property_id, name, distance_mi, rating)
        VALUES ($1, $2, $3, $4)
      `,
      [
        propertyId,
        s.name || null,
        s.distance != null ? Number(s.distance) : null,
        s.rating ?? null,
      ],
    );
  }
}

export async function addUserToDB(email, password) {
  const existing = await pool.query(
    `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );

  if (existing.rows.length) {
    return { success: false, message: "User Already Exists" };
  }

  const hashed = await bcrypt.hash(password, saltRounds);

  await pool.query(
    `
      INSERT INTO users (email, password, role, createdat)
      VALUES ($1, $2, 'user', NOW())
    `,
    [email, hashed],
  );

  return { success: true };
}

export async function getUserByEmail(email, password) {
  const rs = await pool.query(
    `
      SELECT userid, email, password, role
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  if (rs.rows.length === 0) {
    return { success: false, message: "Invalid email or password from db" };
  }

  const user = rs.rows[0];
  const ok = await bcrypt.compare(password, user.password || "");

  if (!ok) {
    return { success: false, message: "Invalid email or password" };
  }

  return {
    success: true,
    user: {
      id: user.userid,
      email: user.email,
      role: user.role,
    },
  };
}

export async function setCode(email, code, purpose, min) {
  const hashed = await bcrypt.hash(code, saltRounds);

  await pool.query(
    `
      UPDATE users
      SET
        otpcode = $2,
        otp_expiry = NOW() + ($4 || ' minutes')::interval,
        otppurpose = $3
      WHERE email = $1
    `,
    [email, hashed, purpose, min || 10],
  );

  return { success: true };
}

export async function compareCode(userCode, dbCode) {
  const ok = await bcrypt.compare(userCode, dbCode);
  if (!ok) {
    return { success: false, message: "Invalid OTP Code" };
  }
  return { success: true };
}

export async function findUserId(id) {
  const rs = await pool.query(
    `
      SELECT
        userid,
        name,
        phone_number,
        email,
        role,
        profileurl,
        coverurl,
        location,
        isactive,
        lastlogin,
        createdat
      FROM users
      WHERE userid = $1
      LIMIT 1
    `,
    [id],
  );

  return mapUserRow(rs.rows[0]);
}

export async function checkPassword(email, password) {
  const rs = await pool.query(
    `
      SELECT password
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  if (rs.rows.length === 0) {
    return { success: false, message: "User not found" };
  }

  const ok = await bcrypt.compare(password, rs.rows[0].password || "");
  return ok
    ? { success: true }
    : { success: false, message: "Password incorrect" };
}

export async function changePassword(email, password) {
  const hashed = await bcrypt.hash(password, saltRounds);

  const rs = await pool.query(
    `
      UPDATE users
      SET password = $2
      WHERE email = $1
      RETURNING userid
    `,
    [email, hashed],
  );

  return rs.rows.length
    ? { success: true }
    : { success: false, message: "Error changing Password" };
}

export async function findAllProperties() {
  const result = await pool.query(`
    SELECT
      p.*,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', i.id,
              'url', i.url
            )
            ORDER BY i.id
          )
          FROM propertygalleryimages i
          WHERE i.property_id = p.property_id
        ),
        '[]'::json
      ) AS images,
      (
        SELECT json_build_object(
          'userId', u.userid,
          'name', u.name,
          'email', u.email,
          'profileUrl', u.profileurl
        )
        FROM users u
        WHERE u.userid = p.agentid
        LIMIT 1
      ) AS agent
    FROM properties p
    WHERE p.published = true
  `);

  return result.rows.map((row) => ({
    ...row,
    images: safeParseJson(row.images, []),
    agent: safeParseJson(row.agent, null),
  }));
}

export async function findPropertyById(id) {
  const result = await pool.query(
    `
      SELECT
        p.*,
        ap.agentapproved AS "agentApproved",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', i.id, 'url', i.url)
              ORDER BY i.id
            )
            FROM propertygalleryimages i
            WHERE i.property_id = p.property_id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', s.id, 'item', s.item)
              ORDER BY s.id
            )
            FROM propertyspecials s
            WHERE s.property_id = p.property_id
          ),
          '[]'::json
        ) AS specials,
        (
          SELECT json_build_object(
            'agentId', a.agentid,
            'agentName', a.name,
            'agentCompany', a.companyname,
            'userId', u.userid,
            'email', u.email,
            'profileUrl', a.profileimage
          )
          FROM agents a
          LEFT JOIN users u ON u.userid = a.userid
          WHERE a.agentid = p.agentid
          LIMIT 1
        ) AS agent
      FROM properties p
      LEFT JOIN approvals ap
        ON ap.property_id = p.property_id
      WHERE p.property_id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    ...row,
    images: safeParseJson(row.images, []),
    specials: safeParseJson(row.specials, []),
    agent: safeParseJson(row.agent, null),
  };
}

export async function getSavedProperties(userId) {
  const result = await pool.query(
    `
      SELECT property_id
      FROM savedproperties
      WHERE userid = $1
    `,
    [userId],
  );

  return result.rows.map((r) => r.property_id);
}

export async function toggleSaved(userId, propertyId) {
  const existing = await pool.query(
    `
      SELECT 1
      FROM savedproperties
      WHERE userid = $1 AND property_id = $2
      LIMIT 1
    `,
    [userId, propertyId],
  );

  if (existing.rows.length) {
    await pool.query(
      `
        DELETE FROM savedproperties
        WHERE userid = $1 AND property_id = $2
      `,
      [userId, propertyId],
    );
    return { success: true, action: "removed" };
  }

  await pool.query(
    `
      INSERT INTO savedproperties (userid, property_id)
      VALUES ($1, $2)
    `,
    [userId, propertyId],
  );

  return { success: true, action: "added" };
}

export async function addSaved(userId, propertyId) {
  await pool.query(
    `
      INSERT INTO savedproperties (userid, property_id)
      VALUES ($1, $2)
    `,
    [userId, propertyId],
  );

  return { success: true };
}

export async function getAgentProperties(userId) {
  const agentRes = await pool.query(
    `
      SELECT agentid
      FROM agents
      WHERE userid = $1
      LIMIT 1
    `,
    [userId],
  );

  const agentId = agentRes.rows[0]?.agentid;
  if (!agentId) return [];

  const result = await pool.query(
    `
      SELECT
        p.*,
        comp.name AS "companyName",
        ap.agentapproved AS "agentApproved"
      FROM properties p
      LEFT JOIN companies comp ON comp.company_id = p.company_id
      LEFT JOIN approvals ap ON ap.property_id = p.property_id
      WHERE p.agentid = $1
    `,
    [agentId],
  );

  return result.rows;
}

export async function getAllUsers() {
  const result = await pool.query(`
    SELECT
      userid AS "userId",
      email,
      role,
      isactive AS "isActive",
      lastlogin AS "lastLogin",
      createdat AS "createdAt",
      profileurl AS "profileUrl",
      name,
      location,
      phone_number
    FROM users
  `);

  return result.rows;
}

export async function getAllAgents() {
  const result = await pool.query(`
    SELECT
      u.userid AS "userId",
      a.*,
      u.email,
      u.role,
      u.profileurl AS "profileUrl",
      u.phone_number,
      u.isactive AS "isActive",
      u.createdat AS "createdAt"
    FROM users u
    LEFT JOIN agents a ON u.userid = a.userid
    WHERE u.role = 'agent'
    ORDER BY u.createdat DESC
  `);

  return result.rows;
}

export async function getAllProperties() {
  const result = await pool.query(`
    SELECT
      p.*,
      a.name AS "agentName",
      a.companyname AS "agentCompany",
      u.email AS "agentEmail"
    FROM properties p
    LEFT JOIN agents a ON p.agentid = a.agentid
    LEFT JOIN users u ON a.userid = u.userid
  `);

  return result.rows;
}

export async function insertPropertyWithImages(
  obj = {},
  galleryUrls = [],
  approval = { agentApproved: 0 },
) {
  const {
    agentId,
    property_type,
    home_type,
    status,
    price,
    bedrooms,
    bathrooms,
    sqft,
    city,
    street,
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
  } = obj;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertProp = await client.query(
      `
        INSERT INTO properties (
          agentid,
          property_type,
          home_type,
          status,
          price,
          bedrooms,
          bathrooms,
          sqft,
          city,
          street,
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
          is_demo
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
          $17,$18,$19,$20,$21,$22,$23
        )
        RETURNING *
      `,
      [
        toStrOrNull(agentId),
        toStrOrNull(property_type),
        toStrOrNull(home_type),
        toStrOrNull(status),
        toNum(price),
        toNum(bedrooms),
        toNum(bathrooms),
        toNum(sqft),
        toStrOrNull(city),
        toStrOrNull(street),
        toStrOrNull(zip_code),
        toNum(latitude),
        toNum(longitude),
        toNum(year_built),
        toNum(acres),
        toNum(parking_spaces),
        toStrOrNull(main_image),
        !!hoa_has,
        hoa_has ? toNum(hoa_fee) : null,
        toStrOrNull(electric),
        toStrOrNull(sewer),
        toStrOrNull(water),
        !!is_demo,
      ],
    );

    const createdProp = insertProp.rows[0];
    if (!createdProp) throw new Error("Property insert failed");

    const propertyId = createdProp.property_id;

    for (const url of galleryUrls) {
      if (!url) continue;
      await client.query(
        `
          INSERT INTO propertygalleryimages (property_id, url)
          VALUES ($1, $2)
        `,
        [propertyId, toStrOrNull(url)],
      );
    }

    await client.query(
      `
        INSERT INTO approvals (property_id, agentapproved)
        VALUES ($1, $2)
        ON CONFLICT (property_id)
        DO UPDATE SET agentapproved = EXCLUDED.agentapproved
      `,
      [propertyId, !!approval?.agentApproved],
    );

    await client.query("COMMIT");

    return {
      ...createdProp,
      images: galleryUrls.map((u) => ({ url: u })),
      agentApproved: approval ? (approval.agentApproved ? 1 : 0) : null,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function updatePropertyPublished(propertyId, published) {
  const result = await pool.query(
    `
      UPDATE properties
      SET published = $2
      WHERE property_id = $1
      RETURNING *
    `,
    [propertyId, !!published],
  );

  return result.rows[0] || null;
}
