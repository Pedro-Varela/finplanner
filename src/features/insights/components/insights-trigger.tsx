"use client";

import { useEffect } from "react";
import { generateInsightsAction } from "@/features/insights/actions";

export function InsightsTrigger() {
    useEffect(() => {
        async function initInsights() {
            // Background trigger to generate new insights when user loads the dashboard/layout
            const res = await generateInsightsAction();

            // If we wanted to trigger Browser Push Notifications, we'd do it here after checking if new insights were created.
            // Since generateAction doesn't return the newly created insights array yet, we'll keep it simple:
            // We just ask for Notification permission on load
            if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "default") {
                    Notification.requestPermission();
                }
            }
        }

        initInsights();
    }, []);

    return null; // This is a headless component
}
