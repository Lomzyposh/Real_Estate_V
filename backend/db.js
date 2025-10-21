import dotenv from 'dotenv';
dotenv.config();

import sql from 'mssql';
import bcrypt, { hash } from 'bcrypt';
const saltRounds = 10;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true
  },
  pool: { min: 1, max: 10, idleTimeoutMillis: 30000 }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('SQL pool error', err);
});


export async function getPool() {
  await poolConnect;    // ensures a single connect() happens
  return pool;
}

process.on('SIGINT', async () => {
  try { await pool.close(); } catch { }
  process.exit(0);
});


export async function getOrCreateCompany(tx, company) {
  if (!company || !company.name) return null;

  let result = await tx.request()
    .input('name', sql.NVarChar(200), company.name)
    .query(`SELECT company_id FROM dbo.Companies WHERE name = @name`);

  if (result.recordset.length) {
    return result.recordset[0].company_id;
  }

  result = await tx.request()
    .input('name', sql.NVarChar(200), company.name)
    .input('logo_img', sql.NVarChar(600), company.logoImg || null)
    .input('address', sql.NVarChar(300), company.address || null)
    .query(`
      INSERT INTO dbo.Companies(name, logo_img, address)
      OUTPUT INSERTED.company_id
      VALUES(@name, @logo_img, @address)
    `);

  return result.recordset[0].company_id;
}

export async function upsertProperty(tx, item, companyId, isDemo = false) {
  const b = item.basic || {};
  const loc = item.location || {};
  const media = item.media || {};
  const feat = item.features || {};
  const util = item.utility || {};
  const hoa = (item.community && item.community.hoa) || {};
  const climate = item.climateFactors || {};

  const req = tx.request()
    // keys/flags
    .input('external_id', sql.Int, b.id)
    .input('is_demo', sql.Bit, isDemo ? 1 : 0)

    // basics
    .input('property_type', sql.NVarChar(50), b.propertyType || null)
    .input('home_type', sql.NVarChar(50), b.homeType || null)
    .input('status', sql.NVarChar(50), b.status || null)
    .input('year_built', sql.Int, b.yearBuilt || null)
    .input('price', sql.Decimal(18, 2), b.price ?? null)
    .input('sqft', sql.Int, b.sqrFt || null)
    .input('acres', sql.Decimal(9, 2), b.acres ?? null)
    .input('floor_count', sql.Int, b.floorCount || null)
    .input('floor_level', sql.Int, b.floorLevel || null)
    .input('bedrooms', sql.Int, b.bedroom || null)
    .input('bathrooms', sql.Int, b.bathroom || null)
    .input('parking_spaces', sql.Int, b.parkingSpaces || null)

    // location
    .input('latitude', sql.Decimal(9, 6), loc.latitude ?? null)
    .input('longitude', sql.Decimal(9, 6), loc.longitude ?? null)
    .input('zip_code', sql.NVarChar(20), loc.ZipCode || null)
    .input('street', sql.NVarChar(200), loc.street || null)

    // media
    .input('main_image', sql.NVarChar(600), media.mainImage || null)
    .input('more_text', sql.NVarChar(sql.MAX), media.moreTextAboutThePlace || null)

    // company
    .input('company_id', sql.Int, companyId || null)

    // features
    .input('has_garage', sql.Bit, feat.hasGarage ?? null)
    .input('has_pool', sql.Bit, feat.hasPool ?? null)
    .input('has_garden', sql.Bit, feat.hasGarden ?? null)

    // utilities
    .input('electric', sql.NVarChar(100), util.electric || null)
    .input('sewer', sql.NVarChar(100), util.sewer || null)
    .input('water', sql.NVarChar(100), util.water || null)

    // HOA
    .input('hoa_has', sql.Bit, hoa.hasHOA ?? null)
    .input('hoa_fee', sql.Decimal(10, 2), hoa.fee ?? null)

    // climate
    .input('flood_factor', sql.TinyInt, climate.floodFactor ?? null)
    .input('fire_factor', sql.TinyInt, climate.fireFactor ?? null)
    .input('wind_factor', sql.TinyInt, climate.windFactor ?? null)
    .input('air_factor', sql.TinyInt, climate.airFactor ?? null)
    .input('heat_factor', sql.TinyInt, climate.heatFactor ?? null);

  const rs = await req.query(`
    MERGE dbo.Properties AS T
    USING (VALUES(@external_id)) AS S(external_id)
      ON T.external_id = S.external_id
    WHEN MATCHED THEN
      UPDATE SET
        property_type = @property_type,
        home_type = @home_type,
        status = @status,
        year_built = @year_built,
        price = @price,
        sqft = @sqft,
        acres = @acres,
        floor_count = @floor_count,
        floor_level = @floor_level,
        bedrooms = @bedrooms,
        bathrooms = @bathrooms,
        parking_spaces = @parking_spaces,
        latitude = @latitude,
        longitude = @longitude,
        zip_code = @zip_code,
        street = @street,
        main_image = @main_image,
        more_text = @more_text,
        company_id = @company_id,
        has_garage = @has_garage,
        has_pool = @has_pool,
        has_garden = @has_garden,
        electric = @electric,
        sewer = @sewer,
        water = @water,
        hoa_has = @hoa_has,
        hoa_fee = @hoa_fee,
        flood_factor = @flood_factor,
        fire_factor = @fire_factor,
        wind_factor = @wind_factor,
        air_factor = @air_factor,
        heat_factor = @heat_factor,
        is_demo = @is_demo
    WHEN NOT MATCHED THEN
      INSERT (
        external_id, property_type, home_type, status, year_built, price, sqft, acres,
        floor_count, floor_level, bedrooms, bathrooms, parking_spaces,
        latitude, longitude, zip_code, street,
        main_image, more_text, company_id,
        has_garage, has_pool, has_garden,
        electric, sewer, water,
        hoa_has, hoa_fee,
        flood_factor, fire_factor, wind_factor, air_factor, heat_factor,
        is_demo
      )
      VALUES (
        @external_id, @property_type, @home_type, @status, @year_built, @price, @sqft, @acres,
        @floor_count, @floor_level, @bedrooms, @bathrooms, @parking_spaces,
        @latitude, @longitude, @zip_code, @street,
        @main_image, @more_text, @company_id,
        @has_garage, @has_pool, @has_garden,
        @electric, @sewer, @water,
        @hoa_has, @hoa_fee,
        @flood_factor, @fire_factor, @wind_factor, @air_factor, @heat_factor,
        @is_demo
      )
    OUTPUT inserted.property_id;
  `);

  return rs.recordset[0].property_id;
}


export async function replaceChildArrays(tx, propertyId, item) {
  // wipe old rows
  await tx.request().input('pid', sql.Int, propertyId).query(`
    DELETE FROM dbo.PropertyGalleryImages   WHERE property_id = @pid;
    DELETE FROM dbo.PropertyParkFeatures    WHERE property_id = @pid;
    DELETE FROM dbo.PropertySpecials        WHERE property_id = @pid;
    DELETE FROM dbo.PropertyRooms           WHERE property_id = @pid;
    DELETE FROM dbo.PropertyKitchenFeatures WHERE property_id = @pid;
    DELETE FROM dbo.PropertyCommunityFeatures WHERE property_id = @pid;
    DELETE FROM dbo.NearbySchools           WHERE property_id = @pid;
  `);

  const images = item.media?.galleryImages || [];
  const parks = item.features?.parkFeatures || [];
  const specials = item.special || [];
  const rooms = item.interior?.rooms || [];
  const kitchen = item.interior?.kitchen?.features || [];
  const comm = item.community?.features || [];
  const schools = item.nearbySchools || [];

  await insertMany(tx, 'dbo.PropertyGalleryImages', 'url', images, propertyId);
  await insertMany(tx, 'dbo.PropertyParkFeatures', 'feature', parks, propertyId);
  await insertMany(tx, 'dbo.PropertySpecials', 'item', specials, propertyId);
  await insertMany(tx, 'dbo.PropertyRooms', 'room_name', rooms, propertyId);
  await insertMany(tx, 'dbo.PropertyKitchenFeatures', 'feature', kitchen, propertyId);
  await insertMany(tx, 'dbo.PropertyCommunityFeatures', 'feature', comm, propertyId);
  await insertNearbySchools(tx, schools, propertyId);
}




export async function insertMany(tx, table, column, rows, propertyId) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  for (const val of rows) {
    await tx.request()
      .input('property_id', sql.Int, propertyId)
      .input('val', sql.NVarChar(600), val)
      .query(`
        INSERT INTO ${table}(property_id, ${column})
        VALUES (@property_id, @val)
      `);
  }
}


export async function insertNearbySchools(tx, schools, propertyId) {
  if (!Array.isArray(schools) || schools.length === 0) return;
  for (const s of schools) {
    await tx.request()
      .input('property_id', sql.Int, propertyId)
      .input('name', sql.NVarChar(200), s.name || null)
      .input('distance', sql.Decimal(4, 1), s.distance != null ? Number(s.distance) : null)
      .input('rating', sql.TinyInt, s.rating ?? null)
      .query(`
        INSERT INTO dbo.NearbySchools(property_id, name, distance_mi, rating)
        VALUES (@property_id, @name, @distance, @rating)
      `);
  }
}


export async function addUserToDB(email, password) {
  const pool = await getPool();

  const exist = await pool.request()
    .input('email', sql.VarChar, email)
    .query('SELECT 1 FROM Users where email = @email');

  if (exist.recordset.length) {
    return { sucess: false, message: 'User Already Exists' }
  }

  const hashed = await bcrypt.hash(password, saltRounds);

  await pool.request()
    .input('email', sql.VarChar, email)
    .input('hashed', sql.VarChar, hashed)
    .query(`INSERT INTO Users (email, password, role, createdAt) VALUES(@email, @hashed, 'user', SYSUTCDATETIME())`)

  return { success: true }

}




export async function getUserByEmail(email, password) {
  const pool = await getPool();

  const rs = await pool.request()
    .input('email', sql.VarChar, email)
    .query(`
      SELECT
      userId, email, password, role
      FROM Users
      WHERE email = @email
    `);

  if (rs.recordset.length === 0) {
    return { success: false, message: 'Invalid email or password from db' };
  }

  const user = rs.recordset[0];
  const ok = await bcrypt.compare(password, user.password || '');
  if (!ok) {
    return { success: false, message: 'Invalid email or password' };
  }

  const sessionUser = {
    id: user.userId,
    email: user.email,
    role: user.role,
  };

  return { success: true, user: sessionUser };
}

export async function setCode(email, code, purpose, min) {
  const pool = await getPool();
  const hashed = await bcrypt.hash(code, saltRounds);

  await pool.request()
    .input('email', sql.VarChar, email)
    .input('hashed', sql.VarChar, hashed)
    .input('purpose', sql.VarChar, purpose)
    .input('mins', sql.Int, min || 10)
    .query(`
      UPDATE Users
      SET
        otpCode = @hashed,
        otpExpiry = DATEADD(MINUTE, @mins, SYSUTCDATETIME()),
        otpPurpose = @purpose
      WHERE email = @email
    `);
  return { success: true };
}

export async function compareCode(userCode, dbCode) {
  const ok = await bcrypt.compare(userCode, dbCode);
  if (!ok) {
    return { success: false, message: 'Invalid OTP Code' };
  }
  return { success: true }
}

export async function findUserId(id) {
  const pool = await getPool();
  const rs = await pool.request()
    .input('id', sql.VarChar, id)
    .query(`
      SELECT userId, name,phone_number, email, role, profileUrl, coverUrl, location
      FROM Users
      WHERE userId = @id
    `);
  return rs.recordset[0];
}

export async function checkPassword(email, password) {
  const pool = await getPool();
  const rs = await pool.request()
    .input('email', sql.VarChar, email)
    .query(`
      SELECT password_hash FROM dbo.Users WHERE email = @email
    `);

  if (rs.recordset.length === 0) {
    return { success: false, message: 'User not found' };
  }

  const ok = await bcrypt.compare(password, rs.recordset[0].password_hash || '');
  return ok
    ? { success: true }
    : { success: false, message: 'Password incorrect' };
}

export async function changePassword(email, password) {
  const pool = await getPool();

  const hashed = await bcrypt.hash(password, saltRounds);

  const ok = await pool.request()
    .input('email', sql.VarChar, email)
    .input('hashed', sql.VarChar, hashed)
    .query(`
      UPDATE Users
      SET
      password = @hashed
      WHERE email = @email
      `);
  return ok
    ? { success: true }
    : { success: false, message: 'Error changing Password' };
}

export async function findPropertyById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query(`
        SELECT
          p.*,
          (
            SELECT
              i.*
            FROM dbo.PropertyGalleryImages AS i
            WHERE i.property_id = p.property_id
            FOR JSON PATH
          ) AS ImagesJson
        FROM dbo.Properties AS p
        WHERE p.property_id = @id;
      `);

  return result.recordset[0] || null;
}

export async function getSavedProperties(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("userId", sql.VarChar, userId)
    .query(`
      SELECT sp.property_id
      FROM dbo.SavedProperties AS sp
      WHERE sp.user_id = @userId
      ORDER BY sp.created_at DESC
    `);

  return (result.recordset || []).map(r => r.property_id);
}

export async function toggleSaved(userId, propertyId) {
  const pool = await getPool();
  const rs = await pool.request()
    .input('userId', sql.VarChar, userId)
    .input('propertyId', sql.Int, propertyId)
    .query(`
    IF EXISTS (
        SELECT 1 FROM dbo.SavedProperties
        WHERE user_id = @userId AND property_id = @propertyId
      )
      BEGIN
        DELETE FROM dbo.SavedProperties
        WHERE user_id = @userId AND property_id = @propertyId;

        SELECT 'removed' AS status;
      END
      ELSE
      BEGIN
        INSERT INTO dbo.SavedProperties(user_id, property_id, created_at)
        VALUES(@userId, @propertyId, GETDATE());

        SELECT 'added' AS status;
      END
    `);
  return rs.recordset?.[0]?.status === 'added'
    ? { success: true, action: 'added' }
    : { success: true, action: 'removed' };
}

export async function addSaved(userId, propertyId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.VarChar, userId)
    .input('propertyId', sql.Int, propertyId)
    .query(`
      INSERT INTO dbo.SavedProperties(user_id, property_id, created_at)
      VALUES(@userId, @propertyId, GETDATE())
    `);
  return { success: true };
}


export {
  sql
};
