// src/pages/AllProperties.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useDeferredValue,
  memo,
} from "react";
import { createPortal } from "react-dom";
import { useProperties } from "../contexts/PropertiesContext";
import { useLoader } from "../contexts/LoaderContext";
import { useSaved } from "../contexts/SavedContext"; // ⬅️ NEW
import LocationSearch from "../components/LocationSearch";
import Toggle from "../components/Toggle";
import MapView from "../components/MapView";
import { PropertyList } from "../components/PropertyCard";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";

/* ---------- utils ---------- */
function uniqueFrom(arr = [], key) {
  const out = new Set();
  for (const it of arr) {
    const v = it?.[key];
    if (v && typeof v === "string") out.add(v.trim());
  }
  return [...out];
}
function norm(v) {
  return v == null ? "" : String(v).trim().toLowerCase();
}
function getZip(p) {
  return norm(p?.zip_code ?? p?.zipCode ?? p?.zipcode ?? "");
}
function getStreet(p) {
  return norm(p?.street ?? p?.street_name ?? "");
}
function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function getNum(p, key) {
  return num(p?.[key]);
}
function getId(p) {
  return p?.property_id ?? p?.id ?? p?._id; // ⬅️ helper for Saved check
}

const MemoMapPane = memo(function MemoMapPane({ headerTop, markers }) {
  return (
    <aside
      className="relative lg:col-span-6 hidden lg:block"
      style={{ position: "sticky", top: headerTop, height: `calc(100vh - ${headerTop}px)` }}
    >
      <div className="h-200 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
        <MapView properties={markers} zoomThreshold={14} dark={false} className="h-full w-full" />
      </div>
    </aside>
  );
});

const SALE = "For Sale";
const RENT = "For Rent";

function normalizeStatus(s) {
  const v = String(s ?? "").trim().toLowerCase();
  if (["rent", "for rent", "rental", "lease", "for-lease", "to let", "to-let"].includes(v)) return RENT;
  if (["sale", "for sale", "sell", "buy", "for-sale"].includes(v)) return SALE;
  return null; // unknown
}

function statusOf(p) {
  const n = normalizeStatus(p?.status);
  if (n) return n;
  if (p?.for_rent === true || p?.is_rental === true || p?.listing_type === "rent") return RENT;
  if (p?.for_sale === true || p?.listing_type === "sale") return SALE;
  if (typeof p?.price_term === "string" && /month|weekly|daily/i.test(p.price_term)) return RENT;
  return SALE;
}

export default function AllProperties() {
  const { properties = [], propertiesLoading } = useProperties();
  const { setShowLoader } = useLoader();
  const { isSaved } = useSaved(); // ⬅️ NEW

  const [locations, setLocations] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const barRef = useRef(null);
  const [headerH, setHeaderH] = useState(72);
  const [searchParams] = useSearchParams();

  useEffect(() => setShowLoader(!!propertiesLoading), [propertiesLoading, setShowLoader]);

  useLayoutEffect(() => {
    const measure = () => {
      if (!barRef.current) return;
      const h = Math.round(barRef.current.offsetHeight);
      if (h && h !== headerH) setHeaderH(h);
    };
    measure();
    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // click-away to close menus
  useEffect(() => {
    const onDocClick = (e) => {
      if (!barRef.current?.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const [filters, setFilters] = useState({
    listing: null,
    type: null,
    status: null,
    city: null,
    bedsMin: null,
    bathsMin: null,
    priceMin: null,
    priceMax: null,
    sqftMin: null,
    parkingMin: null,
    hoaHas: null,
    favOnly: false, // ⬅️ NEW
  });

  useEffect(() => {
    const type = searchParams.get("type") || null; // "rent" | "sale" | null
    const status = searchParams.get("status") || null;
    const priceMax = num(searchParams.get("priceMax"));
    const bedsMin = num(searchParams.get("bedsMin"));
    const city = searchParams.get("city") || null;

    // fav from query (?fav=1, ?favorite=true, ?favourites=yes)
    const favQ =
      searchParams.get("fav") ||
      searchParams.get("favorite") ||
      searchParams.get("favourites") ||
      null;
    const favOnly = typeof favQ === "string" && /^(1|true|yes|y)$/i.test(favQ.trim());

    setFilters((f) => {
      let listingFromType = null;
      if (type) {
        const t = String(type).trim().toLowerCase();
        listingFromType = t === "rent" ? RENT : SALE;
      }

      return {
        ...f,
        listing: status ? normalizeStatus(status) : (listingFromType ?? f.listing),
        type: type || f.type,
        status: status || f.status,
        priceMax: priceMax ?? f.priceMax,
        bedsMin: bedsMin ?? f.bedsMin,
        city: city || f.city,
        favOnly, // ⬅️ NEW
      };
    });
  }, [searchParams]);

  const listingOptions = useMemo(() => [SALE, RENT], []);
  const typeOptions = useMemo(() => uniqueFrom(properties, "home_type"), [properties]);
  const cityOptions = useMemo(() => uniqueFrom(properties, "city"), [properties]);

  const { zipWanted, streetWanted, hasFilters } = useMemo(() => {
    const z = new Set();
    const s = new Set();
    for (const f of locations) {
      if (f?.id?.startsWith?.("zip:")) z.add(f.id.slice(4));
      if (f?.id?.startsWith?.("street:")) s.add(f.id.slice(7));
    }
    return { zipWanted: z, streetWanted: s, hasFilters: z.size > 0 || s.size > 0 };
  }, [locations]);

  const filtered = useMemo(() => {
    if (!properties?.length) return [];
    return properties.filter((p) => {
      const pListing = statusOf(p);
      const okListing = !filters?.listing || pListing === filters.listing;
      const okType = !filters?.type || p?.home_type === filters.type;

      // city/state contains
      const wantCity = norm(filters?.city);
      const pCity = norm(p?.city);
      const pState = norm(p?.state);
      const okCity = !wantCity || pCity.includes(wantCity) || pState.includes(wantCity);

      // numeric
      const pBeds = getNum(p, "bedrooms");
      const pBaths = getNum(p, "bathrooms");
      const pPrice = getNum(p, "price");
      const pSqft = getNum(p, "sqft");
      const pParking = getNum(p, "parking_spaces");

      const okBeds = filters.bedsMin == null || (pBeds != null && pBeds >= Number(filters.bedsMin));
      const okBaths = filters.bathsMin == null || (pBaths != null && pBaths >= Number(filters.bathsMin));
      const okPriceMin = filters.priceMin == null || (pPrice != null && pPrice >= Number(filters.priceMin));
      const okPriceMax = filters.priceMax == null || (pPrice != null && pPrice <= Number(filters.priceMax));
      const okSqft = filters.sqftMin == null || (pSqft != null && pSqft >= Number(filters.sqftMin));
      const okParking = filters.parkingMin == null || (pParking != null && pParking >= Number(filters.parkingMin));

      // boolean HOA
      const rawHoa = p?.hoa_has;
      const pHoa =
        typeof rawHoa === "boolean"
          ? rawHoa
          : rawHoa == null
          ? null
          : rawHoa === 1 ||
            rawHoa === "1" ||
            String(rawHoa).toLowerCase() === "yes" ||
            String(rawHoa).toLowerCase() === "true";
      const okHoa = filters.hoaHas == null || pHoa === filters.hoaHas;

      // favourites-only
      const okFav = !filters.favOnly || isSaved(getId(p)) === true;

      if (!hasFilters) {
        return okListing && okType && okCity && okBeds && okBaths && okPriceMin && okPriceMax && okSqft && okParking && okHoa && okFav;
      }

      // location (zip/street chips)
      const zip = getZip(p);
      const street = getStreet(p);
      const zipOk = zipWanted.size ? zipWanted.has(zip) : false;
      const streetOk = streetWanted.size ? streetWanted.has(street) : false;
      const okLocation = zipOk || streetOk;

      return (
        okListing &&
        okType &&
        okCity &&
        okBeds &&
        okBaths &&
        okPriceMin &&
        okPriceMax &&
        okSqft &&
        okParking &&
        okHoa &&
        okFav &&
        okLocation
      );
    });
  }, [
    properties,
    filters?.listing,
    filters?.type,
    filters?.city,
    filters?.bedsMin,
    filters?.bathsMin,
    filters?.priceMin,
    filters?.priceMax,
    filters?.sqftMin,
    filters?.parkingMin,
    filters?.hoaHas,
    filters?.favOnly, // ⬅️ NEW
    isSaved, // ⬅️ NEW
    hasFilters,
    zipWanted,
    streetWanted,
  ]);

  const deferredFiltered = useDeferredValue(filtered);

  const mapMarkers = useMemo(
    () =>
      deferredFiltered.map((p) => ({
        id: getId(p),
        lat: p.latitude,
        lng: p.longitude,
        title: p.title ?? p.street ?? "",
        price: p.price,
        status: statusOf(p),
      })),
    [deferredFiltered]
  );

  const toggleMenu = (m) => setOpenMenu((cur) => (cur === m ? null : m));
  const selectFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setOpenMenu(null);
  };
  const setMany = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => {
    setFilters({
      listing: null,
      type: null,
      city: null,
      status: null,
      bedsMin: null,
      bathsMin: null,
      priceMin: null,
      priceMax: null,
      sqftMin: null,
      parkingMin: null,
      hoaHas: null,
      favOnly: false, // ⬅️ reset
    });
    setLocations([]);
    setOpenMenu(null);
  };

  if (propertiesLoading) return null;

  return (
    <div className="min-h-screen">
      <div className="mt-18" />

      <div
        ref={barRef}
        className={clsx("sticky top-20 z-40 w-full bg-white/70 backdrop-blur", "dark:bg-slate-900/60")}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* mobile top bar */}
          <div className="flex items-center justify-between py-2 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95"
            >
              Filters
            </button>

            <div className="flex items-center gap-2">
              <div className="h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 flex">
                {filtered.length} found
              </div>
              <button
                onClick={clearAll}
                className="h-11 whitespace-nowrap rounded-xl border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Clear all filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* desktop bar */}
          <div
            className={clsx(
              "hidden lg:flex items-center gap-3 rounded-2xl px-3 py-2",
              "bg-white/60 shadow-sm",
              "dark:bg-slate-900/50"
            )}
          >
            {/* Listing */}
            <div className="relative">
              <DropdownButton
                label={filters.listing || "For Sale"}
                open={openMenu === "listing"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("listing");
                }}
              />
              {openMenu === "listing" && (
                <Menu className="w-44">
                  {(listingOptions.length ? listingOptions : ["Buy", "Rent", "Lease"]).map((opt) => (
                    <MenuItem key={opt} onClick={() => selectFilter("listing", opt)}>
                      {opt}
                    </MenuItem>
                  ))}
                  <MenuClear onClick={() => selectFilter("listing", null)} />
                </Menu>
              )}
            </div>

            {/* Type */}
            <div className="relative">
              <DropdownButton
                label={filters.type || "Type"}
                open={openMenu === "type"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("type");
                }}
              />
              {openMenu === "type" && (
                <Menu className="w-48">
                  {(typeOptions.length ? typeOptions : ["Apartment", "Bungalow", "Duplex", "Storey"]).map((opt) => (
                    <MenuItem key={opt} onClick={() => selectFilter("type", opt)}>
                      {opt}
                    </MenuItem>
                  ))}
                  <MenuClear onClick={() => selectFilter("type", null)} />
                </Menu>
              )}
            </div>

            {/* City */}
            <div className="relative">
              <DropdownButton
                label={filters.city || "City"}
                open={openMenu === "city"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("city");
                }}
              />
              {openMenu === "city" && (
                <Menu className="w-48">
                  {(cityOptions.length ? cityOptions : ["Lagos", "Abuja", "Port Harcourt", "Ibadan"]).map((opt) => (
                    <MenuItem key={opt} onClick={() => selectFilter("city", opt)}>
                      {opt}
                    </MenuItem>
                  ))}
                  <MenuClear onClick={() => selectFilter("city", null)} />
                </Menu>
              )}
            </div>

            {/* location input */}
            <div className="flex-1">
              <div className="h-11">
                <LocationSearch
                  properties={properties}
                  selected={locations}
                  onChange={setLocations}
                  placeholder="Search by zipcode or street…"
                />
              </div>
            </div>

            {/* More Filters */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("more");
                }}
                className={clsx(
                  "h-11 whitespace-nowrap rounded-xl border px-4 text-sm font-medium",
                  "border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95",
                  "dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                )}
              >
                More Filters
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={clsx("ml-1 inline h-4 w-4 align-[-1px] transition-transform", openMenu === "more" && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openMenu === "more" && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[26rem] overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-[#151618]">
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledSelect
                      label="Listing"
                      value={filters.listing ?? ""}
                      onChange={(e) => setMany({ listing: e.target.value || null })}
                      options={[
                        { label: "Any", value: "" },
                        { label: SALE, value: SALE },
                        { label: RENT, value: RENT },
                      ]}
                    />

                    <LabeledSelect
                      label="Min Beds"
                      value={filters.bedsMin ?? ""}
                      onChange={(e) => setMany({ bedsMin: e.target.value ? Number(e.target.value) : null })}
                      options={[
                        { label: "Any", value: "" },
                        { label: "1+ Beds", value: 1 },
                        { label: "2+ Beds", value: 2 },
                        { label: "3+ Beds", value: 3 },
                        { label: "4+ Beds", value: 4 },
                        { label: "5+ Beds", value: 5 },
                      ]}
                    />
                    <LabeledSelect
                      label="Min Baths"
                      value={filters.bathsMin ?? ""}
                      onChange={(e) => setMany({ bathsMin: e.target.value ? Number(e.target.value) : null })}
                      options={[
                        { label: "Any", value: "" },
                        { label: "1+ Baths", value: 1 },
                        { label: "2+ Baths", value: 2 },
                        { label: "3+ Baths", value: 3 },
                        { label: "4+ Baths", value: 4 },
                      ]}
                    />
                    <LabeledInput
                      label="Price min"
                      type="number"
                      value={filters.priceMin ?? ""}
                      onChange={(e) => setMany({ priceMin: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 50000"
                    />
                    <LabeledInput
                      label="Price max"
                      type="number"
                      value={filters.priceMax ?? ""}
                      onChange={(e) => setMany({ priceMax: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 300000"
                    />
                    <LabeledInput
                      label="Min Sqft"
                      type="number"
                      value={filters.sqftMin ?? ""}
                      onChange={(e) => setMany({ sqftMin: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 1200"
                    />
                    <LabeledInput
                      label="Min Parking"
                      type="number"
                      value={filters.parkingMin ?? ""}
                      onChange={(e) => setMany({ parkingMin: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 1"
                    />

                    {/* HOA */}
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">HOA</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMany({ hoaHas: true })}
                          className={clsx(
                            "h-10 flex-1 rounded-lg border text-sm",
                            filters.hoaHas === true
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setMany({ hoaHas: false })}
                          className={clsx(
                            "h-10 flex-1 rounded-lg border text sm",
                            filters.hoaHas === false
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          No
                        </button>
                        <button
                          onClick={() => setMany({ hoaHas: null })}
                          className={clsx(
                            "h-10 flex-1 rounded-lg border text-sm",
                            filters.hoaHas == null
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          Any
                        </button>
                      </div>
                    </div>

                    {/* ⭐ Favourites only */}
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                          checked={!!filters.favOnly}
                          onChange={(e) => setMany({ favOnly: e.target.checked })}
                        />
                        Favourites only
                      </label>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setMany({
                          bedsMin: null,
                          bathsMin: null,
                          priceMin: null,
                          priceMax: null,
                          sqftMin: null,
                          parkingMin: null,
                          hoaHas: null,
                          favOnly: false, // reset
                        })
                      }
                      className="rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setOpenMenu(null)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* map toggle + reset + count */}
            <div className="flex h-11 items-center gap-2 whitespace-nowrap pl-1">
              <span className="text-sm text-slate-700 dark:text-slate-100">
                {showMap ? "Hide Map" : "Show Map"}
              </span>
              <Toggle checked={showMap} onChange={setShowMap} />
            </div>

            <button
              onClick={clearAll}
              className="h-11 whitespace-nowrap rounded-xl border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Clear all filters"
            >
              Reset
            </button>

            <div className="hidden h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:flex">
              {filtered.length} found
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filters">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <LabeledSelect
              label="Listing"
              value={filters.listing ?? ""}
              onChange={(e) => setMany({ listing: e.target.value || null })}
              options={[
                { label: "Any", value: "" },
                ...(listingOptions.length ? listingOptions : ["Buy", "Rent", "Lease"]).map((x) => ({
                  label: x,
                  value: x,
                })),
              ]}
            />
            <LabeledSelect
              label="Type"
              value={filters.type ?? ""}
              onChange={(e) => setMany({ type: e.target.value || null })}
              options={[
                { label: "Any", value: "" },
                ...(typeOptions.length ? typeOptions : ["Apartment", "Bungalow", "Duplex", "Storey"]).map((x) => ({
                  label: x,
                  value: x,
                })),
              ]}
            />
          </div>

          <LabeledSelect
            label="City"
            value={filters.city ?? ""}
            onChange={(e) => setMany({ city: e.target.value || null })}
            options={[
              { label: "Any", value: "" },
              ...(cityOptions.length ? cityOptions : ["Lagos", "Abuja", "Port Harcourt", "Ibadan"]).map((x) => ({
                label: x,
                value: x,
              })),
            ]}
          />

          <div>
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Location</span>
            <div className="h-11">
              <LocationSearch
                properties={properties}
                selected={locations}
                onChange={setLocations}
                placeholder="Search by zipcode or street…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledSelect
              label="Min Beds"
              value={filters.bedsMin ?? ""}
              onChange={(e) => setMany({ bedsMin: e.target.value ? Number(e.target.value) : null })}
              options={[
                { label: "Any", value: "" },
                { label: "1+ Beds", value: 1 },
                { label: "2+ Beds", value: 2 },
                { label: "3+ Beds", value: 3 },
                { label: "4+ Beds", value: 4 },
                { label: "5+ Beds", value: 5 },
              ]}
            />
            <LabeledSelect
              label="Min Baths"
              value={filters.bathsMin ?? ""}
              onChange={(e) => setMany({ bathsMin: e.target.value ? Number(e.target.value) : null })}
              options={[
                { label: "Any", value: "" },
                { label: "1+ Baths", value: 1 },
                { label: "2+ Baths", value: 2 },
                { label: "3+ Baths", value: 3 },
                { label: "4+ Baths", value: 4 },
              ]}
            />
            <LabeledInput
              label="Price min"
              type="number"
              value={filters.priceMin ?? ""}
              onChange={(e) => setMany({ priceMin: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 50000"
            />
            <LabeledInput
              label="Price max"
              type="number"
              value={filters.priceMax ?? ""}
              onChange={(e) => setMany({ priceMax: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 300000"
            />
            <LabeledInput
              label="Min Sqft"
              type="number"
              value={filters.sqftMin ?? ""}
              onChange={(e) => setMany({ sqftMin: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 1200"
            />
            <LabeledInput
              label="Min Parking"
              type="number"
              value={filters.parkingMin ?? ""}
              onChange={(e) => setMany({ parkingMin: e.target.value ? Number(e.target.value) : null })}
              placeholder="e.g. 1"
            />

            {/* HOA */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">HOA</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMany({ hoaHas: true })}
                  className={clsx(
                    "h-10 flex-1 rounded-lg border text-sm",
                    filters.hoaHas === true
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Yes
                </button>
                <button
                  onClick={() => setMany({ hoaHas: false })}
                  className={clsx(
                    "h-10 flex-1 rounded-lg border text sm",
                    filters.hoaHas === false
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg- slate-800"
                  )}
                >
                  No
                </button>
                <button
                  onClick={() => setMany({ hoaHas: null })}
                  className={clsx(
                    "h-10 flex-1 rounded-lg border text-sm",
                    filters.hoaHas == null
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Any
                </button>
              </div>
            </div>

            {/* ⭐ Favourites only (mobile) */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                  checked={!!filters.favOnly}
                  onChange={(e) => setMany({ favOnly: e.target.checked })}
                />
                Favourites only
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={clearAll}
              className="rounded-lg px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
            >
              Reset
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      </FilterDrawer>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 py-5 lg:grid-cols-12">
          <section className={clsx(showMap ? "lg:col-span-6" : "lg:col-span-12")}>
            <PropertyList properties={filtered} />
          </section>

          {showMap && <MemoMapPane headerTop={headerH} markers={mapMarkers} />}
        </div>
      </div>
    </div>
  );
}

function FilterDrawer({ open, onClose, title, children }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      <div
        className={clsx(
          "fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          "fixed inset-y-0 right-0 z-[9999] w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 dark:bg-[#0b1220]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100vh-56px)] overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </>,
    document.body
  );
}

function DropdownButton({ label, open, onClick }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={clsx(
          "h-11 whitespace-nowrap rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95",
          open && "ring-2 ring-emerald-400/60"
        )}
      >
        {label}{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={clsx("inline h-4 w-4 align-[-1px] transition-transform", open && "rotate-180")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

function Menu({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-[#151618]",
        className
      )}
    >
      {children}
    </div>
  );
}
function MenuItem({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}
function MenuClear({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full bg-rose-100 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-900/60"
    >
      Clear
    </button>
  );
}
function LabeledInput({ label, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        {...rest}
        className={clsx(
          "h-10 w-full rounded-lg border px-3 text-sm outline-none",
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
          "dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-white/10"
        )}
      />
    </label>
  );
}
function LabeledSelect({ label, options = [], ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <select
        {...rest}
        className={clsx(
          "h-10 w-full rounded-lg border px-3 text-sm outline-none",
          "border-slate-300 bg-white text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
          "dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-100 dark:focus:ring-white/10"
        )}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
