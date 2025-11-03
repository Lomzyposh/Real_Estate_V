import React, { useState } from "react";

const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

export default function ImportPropertiesButton({ fileUrl = "/data/property.json", batchSize = 100 }) {
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const [progress, setProgress] = useState({ total: 0, done: 0 });
    const [results, setResults] = useState(null);

    const runImport = async () => {
        setStatus("loading");
        setMessage("Fetching local JSON…");
        setResults(null);
        setProgress({ total: 0, done: 0 });

        try {
            const resp = await fetch(fileUrl, { cache: "no-store" });
            if (!resp.ok) throw new Error(`Failed to fetch ${fileUrl}: ${resp.status}`);
            const data = await resp.json();

            const list = Array.isArray(data) ? data : (Array.isArray(data?.properties) ? data.properties : []);
            if (!Array.isArray(list) || list.length === 0) {
                throw new Error("JSON must be a non-empty array (or { properties: [...] }).");
            }

            const batches = chunk(list, batchSize);
            setProgress({ total: batches.length, done: 0 });

            const allResults = [];
            for (let i = 0; i < batches.length; i++) {
                setMessage(`Posting batch ${i + 1} of ${batches.length}…`);

                const res = await fetch("/api/import/properties", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(batches[i]),
                });

                const out = await res.json();
                if (!res.ok) {
                    allResults.push({ error: true, batch: i + 1, detail: out });
                } else {
                    allResults.push(out);
                }

                setProgress({ total: batches.length, done: i + 1 });
            }

            setResults(allResults);
            setMessage("Import complete.");
            setStatus("done");
        } catch (err) {
            console.error(err);
            setMessage(err.message || "Import failed.");
            setStatus("error");
        }
    };

    return (
        <div className="p-4 rounded-lg border max-w-xl space-y-3">
            <div className="flex items-center gap-3">
                <button
                    onClick={runImport}
                    disabled={status === "loading"}
                    className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                    {status === "loading" ? "Importing…" : "Import Properties"}
                </button>
                <span className="text-sm text-gray-600">{message}</span>
            </div>

            {status === "loading" && progress.total > 0 && (
                <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                        className="h-2 bg-blue-600 rounded"
                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                </div>
            )}

            {results && (
                <details className="mt-2">
                    <summary className="cursor-pointer">See server results</summary>
                    <pre className="mt-2 p-3 bg-gray-50 overflow-auto text-sm">
                        {JSON.stringify(results, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
}
