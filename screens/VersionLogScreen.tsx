import React, {useMemo, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Platform,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Constants from "expo-constants";

// Load local JSON (bundled with the app)
import changelogRaw from "../assets/changelog.json";

type ChangeItem = string | { type?: string; text: string };
type ChangelogEntry = {
    version: string;
    date: string;          // ISO or readable
    changes: ChangeItem[]; // string[] or objects
};

type Section = {
    title: string;         // e.g. "v1.2.0 • 2025-08-15"
    data: ChangeItem[];
    meta: { version: string; date: string };
};

const typeColor = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t === "added" || t === "new") return "#16a34a";
    if (t === "fixed") return "#2563eb";
    if (t === "changed" || t === "improved" || t === "updated") return "#ca8a04";
    if (t === "removed" || t === "deprecated") return "#dc2626";
    return "#6b7280";
};

export default function VersionLogScreen() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // App version/build pulled from Expo (fallbacks included)
    const appVersion = Constants?.manifest2?.extra?.expoClient?.version
        || Constants?.expoConfig?.version
        || Constants?.manifest?.version
        || "N/A";

    const buildNumber =
        (Platform.OS === "ios"
            ? Constants?.expoConfig?.ios?.buildNumber
            : Constants?.expoConfig?.android?.versionCode) ?? "N/A";

    const sections = useMemo<Section[]>(() => {
        const entries = (changelogRaw as ChangelogEntry[]).slice();
        // Optional: sort newest first
        entries.sort((a, b) => (a.date < b.date ? 1 : -1));
        return entries.map((entry) => ({
            title: `v${entry.version} • ${new Date(entry.date).toLocaleDateString()}`,
            data: entry.changes,
            meta: {version: entry.version, date: entry.date},
        }));
    }, []);

    const toggle = (version: string) =>
        setExpanded((prev) => ({...prev, [version]: !prev[version]}));

    const renderSectionHeader = ({section}: { section: Section }) => {
        const isOpen = expanded[section.meta.version];
        return (
            <TouchableOpacity
                onPress={() => toggle(section.meta.version)}
                activeOpacity={0.8}
                style={styles.header}
            >
                <View style={styles.headerLeft}>
                    <Ionicons
                        name={isOpen ? "chevron-down" : "chevron-forward"}
                        size={18}
                        color="#111827"
                        style={{marginRight: 6}}
                    />
                    <Text style={styles.headerTitle}>{section.title}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.versionBadge}>v{section.meta.version}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({item, section}: { item: ChangeItem; section: Section }) => {
        // Only render items when expanded
        if (!expanded[section.meta.version]) return null;

        if (typeof item === "string") {
            return (
                <View style={styles.itemRow}>
                    <View style={[styles.dot, {backgroundColor: typeColor()}]}/>
                    <Text style={styles.itemText}>{item}</Text>
                </View>
            );
        }

        return (
            <View style={styles.itemRow}>
                <View style={[styles.badge, {backgroundColor: typeColor(item.type)}]}>
                    <Text style={styles.badgeText}>{item.type || "Change"}</Text>
                </View>
                <Text style={styles.itemText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header / App Info */}
            <View style={styles.topCard}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Ionicons name="information-circle-outline" size={18} color="#6366F1"/>
                    <Text style={styles.topTitle}> Version Log</Text>
                </View>
                <View style={styles.topMeta}>
                    <Text style={styles.metaText}>
                        App Version: <Text style={styles.metaStrong}>{appVersion}</Text>
                    </Text>
                    <Text style={styles.metaText}>
                        Build: <Text style={styles.metaStrong}>{String(buildNumber)}</Text>
                    </Text>
                </View>
            </View>

            {/* Sections */}
            <SectionList
                sections={sections}
                keyExtractor={(_, idx) => String(idx)}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator}/>}
                SectionSeparatorComponent={() => <View style={styles.sectionGap}/>}
                contentContainerStyle={{paddingBottom: 24}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F9FAFB",
    },
    topCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 2},
        elevation: 2,
    },
    topTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    topMeta: {
        flexDirection: "row",
        gap: 12,
        marginTop: 6,
    },
    metaText: {
        color: "#4B5563",
    },
    metaStrong: {
        color: "#111827",
        fontWeight: "600",
    },
    header: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerRight: {},
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    versionBadge: {
        backgroundColor: "#EEF2FF",
        color: "#4338CA",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        overflow: "hidden",
        fontWeight: "700",
        fontSize: 12,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    itemText: {
        color: "#374151",
        fontSize: 14,
        flexShrink: 1,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginRight: 10,
        opacity: 0.9,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    badgeText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    separator: {
        height: 6,
    },
    sectionGap: {
        height: 12,
    },
});
