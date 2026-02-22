/**
 * Centralized Analysis Data Transformer
 * Single source of truth for transforming analysis data for both UI and PDF
 *
 * This module ensures consistency between:
 * - The Analysis page (UI display)
 * - The PDF report (downloaded file)
 */

import { TRANSLATIONS } from "./translations";

/**
 * Clamp a value between min and max (default 0-100)
 */
export function clamp(val, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Number(val) || 0));
}

/**
 * Get the verdict key for risk based on value
 * Risk: lower is better (0-29 = very_safe, 30-62 = not_safe, 63+ = unsafe)
 */
export function getRiskVerdictKey(val) {
    const v = clamp(val);
    if (v <= 29) return "very_safe";
    if (v <= 62) return "not_safe";
    return "unsafe";
}

/**
 * Get the verdict key for clarity/score based on value
 * Clarity/Score: higher is better (63+ = very_safe, 30-62 = not_safe, 0-29 = unsafe)
 */
export function getClarityVerdictKey(val) {
    const v = clamp(val);
    if (v >= 63) return "very_safe";
    if (v >= 30) return "not_safe";
    return "unsafe";
}

/**
 * Map verdict key to translation key
 */
export function verdictToTranslationKey(verdictKey) {
    switch (verdictKey) {
        case "very_safe":
            return "verySafe";
        case "not_safe":
            return "notThatSafe";
        default:
            return "unsafe";
    }
}

/**
 * Get color band based on metric and value
 */
export function getBandColor(metric, value) {
    const v = clamp(value);

    switch (metric) {
        case "risk":
            // Risk: low is good (green), high is bad (red)
            if (v <= 29) return "green";
            if (v <= 62) return "orange";
            return "red";

        case "clarity":
        case "score":
        case "confidence":
            // These: high is good (green), low is bad (red)
            if (v <= 29) return "red";
            if (v <= 62) return "orange";
            return "green";

        case "professionalism":
        case "favorability":
            // 0-29 red, 30-70 orange, 71+ green
            if (v <= 29) return "red";
            if (v <= 70) return "orange";
            return "green";

        case "deadline":
            // Deadline pressure: low is good (green), high is bad (red)
            if (v <= 29) return "green";
            if (v <= 64) return "orange";
            return "red";

        default:
            return "orange";
    }
}

/**
 * Get hex color for a metric value
 */
export function getColorHex(metric, value) {
    const band = getBandColor(metric, value);
    switch (band) {
        case "green":
            return "#28e070";
        case "orange":
            return "#df911a";
        case "red":
            return "#fe0000";
        default:
            return "#df911a";
    }
}

/**
 * Get CSS variable color for a metric value
 */
export function getColorVar(metric, value) {
    const band = getBandColor(metric, value);
    switch (band) {
        case "green":
            return "var(--green)";
        case "orange":
            return "var(--orange)";
        case "red":
            return "var(--red)";
        default:
            return "var(--orange)";
    }
}

/**
 * Normalize a list value (handle arrays, strings, objects)
 */
export function normalizeList(value) {
    if (Array.isArray(value)) {
        return value
            .filter(Boolean)
            .map((x) => String(x).trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n|•|- /g)
            .map((s) => String(s).trim())
            .filter(Boolean);
    }

    // Handle object with items/list/values property
    if (value && typeof value === "object") {
        const arr = value.items || value.list || value.values;
        if (Array.isArray(arr)) {
            return arr
                .filter(Boolean)
                .map((x) => String(x).trim())
                .filter(Boolean);
        }
    }

    return [];
}

/**
 * Get translations for a language with English fallback
 */
export function getTranslations(lang) {
    return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

/**
 * Get a translated label with fallbacks
 */
export function getLabel(lang, key, fallback) {
    const tr = getTranslations(lang);
    return tr[key] || TRANSLATIONS.en[key] || fallback || key;
}

/**
 * Get the translated verdict label
 */
export function getVerdictLabel(lang, verdictKey) {
    const trKey = verdictToTranslationKey(verdictKey);
    return getLabel(lang, trKey, "Unsafe");
}

/**
 * Transform raw analysis data for consistent display
 * This is the single source of truth for data transformation
 *
 * @param {Object} options
 * @param {Object} options.rawData - The raw analysis data from API/localStorage
 * @param {string} options.lang - The target language code
 * @param {Object} options.cachedTranslation - Cached translation from on-demand translation
 * @returns {Object} Transformed data ready for display
 */
export function transformAnalysisData({
    rawData,
    lang = "en",
    cachedTranslation = {},
}) {
    const analysis = rawData?.analysis || {};
    const tr = getTranslations(lang);

    // API translations (from initial analyze call)
    const apiTranslation =
        rawData?.translations?.[lang]?.analysis ||
        rawData?.translations?.[String(lang || "").toUpperCase()]?.analysis ||
        {};

    // Helper to get translated content with proper fallback chain
    const getTranslatedArray = (key, fallback = []) => {
        // Priority: cached translation > API translation > original > fallback
        if (
            Array.isArray(cachedTranslation[key]) &&
            cachedTranslation[key].length
        ) {
            return cachedTranslation[key];
        }
        if (Array.isArray(apiTranslation[key]) && apiTranslation[key].length) {
            return apiTranslation[key];
        }
        if (Array.isArray(analysis[key]) && analysis[key].length) {
            return analysis[key];
        }
        return normalizeList(fallback);
    };

    // Extract values with clamping
    const riskValue = clamp(analysis.risk?.value);
    const clarityValue = clamp(analysis.clarity?.value);
    const scoreValue = clamp(analysis.scoreChecker?.value);
    const professionalism = clamp(analysis.bars?.professionalism);
    const favorability = clamp(analysis.bars?.favorabilityIndex);
    const deadlinePressure = clamp(analysis.bars?.deadlinePressure);
    const confidenceToSign = clamp(analysis.bars?.confidenceToSign);

    // Calculate verdicts
    const riskVerdictKey = getRiskVerdictKey(riskValue);
    const clarityVerdictKey = getClarityVerdictKey(clarityValue);
    const scoreVerdictKey = getClarityVerdictKey(scoreValue);

    // Get translated notes with fallback to static translations
    const riskNote =
        cachedTranslation.riskNote ||
        apiTranslation.riskNote ||
        analysis.risk?.note ||
        tr.riskStatic ||
        TRANSLATIONS.en.riskStatic;

    const clarityNote =
        cachedTranslation.clarityNote ||
        apiTranslation.clarityNote ||
        analysis.clarity?.note ||
        tr.clarityStatic ||
        TRANSLATIONS.en.clarityStatic;

    const scoreLine =
        cachedTranslation.scoreLine ||
        apiTranslation.scoreLine ||
        analysis.scoreChecker?.line ||
        tr.scoreStatic ||
        TRANSLATIONS.en.scoreStatic;

    // Get translated arrays
    const summary = getTranslatedArray("summary", analysis.summary || []);
    const mainClauses = getTranslatedArray(
        "mainClauses",
        analysis.mainClauses || ["—"],
    );
    const potentialIssues = getTranslatedArray(
        "potentialIssues",
        analysis.potentialIssues || ["—"],
    );
    const smartSuggestions = getTranslatedArray(
        "smartSuggestions",
        analysis.smartSuggestions || [],
    );

    // Get title
    const title =
        cachedTranslation.contractTitle ||
        apiTranslation.contractTitle ||
        rawData?.contractTitle ||
        rawData?.contractName ||
        "Contract";

    return {
        // Title
        title,

        // Content arrays
        summary,
        mainClauses,
        potentialIssues,
        smartSuggestions,

        // Risk section
        risk: {
            value: riskValue,
            note: riskNote,
            verdictKey: riskVerdictKey,
            verdictLabel: getVerdictLabel(lang, riskVerdictKey),
            band: getBandColor("risk", riskValue),
            color: getColorHex("risk", riskValue),
            colorVar: getColorVar("risk", riskValue),
        },

        // Clarity section
        clarity: {
            value: clarityValue,
            note: clarityNote,
            verdictKey: clarityVerdictKey,
            verdictLabel: getVerdictLabel(lang, clarityVerdictKey),
            band: getBandColor("clarity", clarityValue),
            color: getColorHex("clarity", clarityValue),
            colorVar: getColorVar("clarity", clarityValue),
        },

        // Score section
        score: {
            value: scoreValue,
            line: scoreLine,
            verdictKey: scoreVerdictKey,
            verdictLabel: getVerdictLabel(lang, scoreVerdictKey),
            band: getBandColor("score", scoreValue),
            color: getColorHex("score", scoreValue),
            colorVar: getColorVar("score", scoreValue),
        },

        // Meter bars
        meters: {
            professionalism: {
                value: professionalism,
                band: getBandColor("professionalism", professionalism),
                color: getColorHex("professionalism", professionalism),
                colorVar: getColorVar("professionalism", professionalism),
            },
            favorability: {
                value: favorability,
                band: getBandColor("favorability", favorability),
                color: getColorHex("favorability", favorability),
                colorVar: getColorVar("favorability", favorability),
            },
            deadline: {
                value: deadlinePressure,
                band: getBandColor("deadline", deadlinePressure),
                color: getColorHex("deadline", deadlinePressure),
                colorVar: getColorVar("deadline", deadlinePressure),
            },
            confidence: {
                value: confidenceToSign,
                band: getBandColor("confidence", confidenceToSign),
                color: getColorHex("confidence", confidenceToSign),
                colorVar: getColorVar("confidence", confidenceToSign),
            },
        },

        // Static labels (translated)
        labels: tr,

        // Language
        lang,
    };
}

/**
 * Transform analysis data specifically for PDF generation
 * This ensures the PDF receives the exact same data as the UI
 *
 * @param {Object} transformedData - Data from transformAnalysisData()
 * @returns {Object} Data structured for PDFGenerator
 */
export function transformForPDF(transformedData) {
    const { labels } = transformedData;

    return {
        title: transformedData.title,
        summary: transformedData.summary,

        risk: {
            value: transformedData.risk.value,
            note: transformedData.risk.note,
            safety: transformedData.risk.verdictLabel,
            band: transformedData.risk.band,
        },

        clarity: {
            value: transformedData.clarity.value,
            note: transformedData.clarity.note,
            safety: transformedData.clarity.verdictLabel,
            band: transformedData.clarity.band,
        },

        clauses: transformedData.mainClauses,
        issues: transformedData.potentialIssues,
        suggestions: transformedData.smartSuggestions,

        meters: {
            professionalism: transformedData.meters.professionalism.value,
            favorability: transformedData.meters.favorability.value,
            deadline: transformedData.meters.deadline.value,
            confidence: transformedData.meters.confidence.value,
        },

        analysis: {
            scoreChecker: {
                value: transformedData.score.value,
                line: transformedData.score.line,
                safety: transformedData.score.verdictLabel,
                band: transformedData.score.band,
                verdict: transformedData.score.verdictKey,
            },
        },

        // Pass static translations for PDF labels
        staticLabels: labels,
    };
}
