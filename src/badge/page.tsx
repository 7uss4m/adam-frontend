/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { IoDiamond } from "react-icons/io5";
import { Lock, ArrowLeft, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import type { Level, User } from "../types/types";
import getLevels from "../api/getLevels";
import getUser from "../api/getUser";
import Spinner from "../components/Spinner";

const COLORSLIST = ["#CD7F32", "#C0C0C0", "#FFD700", "#9206f8", "#B9F2FF"];

function getUserLevel(levels: Level[], userProgress: number) {
  if (!levels?.length) return null;

  if (userProgress < levels[0]?.max) {
    return { id: 0, name: "bronze", max: 0 } as unknown as Level;
  }

  for (let i = 1; i < levels.length; i++) {
    if (userProgress < levels[i].max) return levels[i - 1];
  }
  return levels[levels.length - 1];
}

function getUserNextLevel(levels: Level[], userProgress: number) {
  if (!levels?.length) return null;

  for (let i = 0; i < levels.length; i++) {
    if (userProgress < levels[i].max) return levels[i];
  }
  return null;
}

function calcProgressForLevel(
  level: Level,
  userProgress: number,
  prevMax: number
) {
  // progress within this tier (from prevMax → level.max)
  const span = Math.max(1, Number(level.max) - Number(prevMax));
  const clamped = Math.min(Math.max(userProgress - prevMax, 0), span);
  return Math.trunc((clamped / span) * 100);
}

export default function Badge() {
  const [t, i18n] = useTranslation("global");

  const getUserQuery = useQuery<User, Error>({
    queryKey: ["user", "id"],
    queryFn: async () => {
      const response = await getUser(localStorage.getItem("token") as string);
      return response.data.result as User;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const getLevelsQuery = useQuery<Level[], Error>({
    queryKey: ["levels"],
    queryFn: async () => {
      const response = await getLevels();
      return response.data.result as Level[];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loading = getUserQuery.isLoading || getLevelsQuery.isLoading;

  const { levels, userProgress, nextLevel } = useMemo(() => {
    const levels = getLevelsQuery.data || [];
    const userProgress = Number(getUserQuery.data?.progress ?? 0);

    return {
      levels,
      userProgress,
      userLevel: getUserLevel(levels, userProgress),
      nextLevel: getUserNextLevel(levels, userProgress),
    };
  }, [getLevelsQuery.data, getUserQuery.data?.progress]);

  // precompute tier progress
  const tiers = useMemo(() => {
    const lvls = levels || [];
    const up = userProgress ?? 0;

    return lvls.map((lvl, idx) => {
      const prevMax = idx === 0 ? 0 : Number(lvls[idx - 1]?.max ?? 0);
      const progress = calcProgressForLevel(lvl, up, prevMax);
      const isUnlocked = up >= prevMax; // reached tier start
      const isCompleted = up >= Number(lvl.max);
      return { lvl, idx, prevMax, progress, isUnlocked, isCompleted };
    });
  }, [levels, userProgress]);

  useEffect(() => {
    if (getLevelsQuery.isError) console.error(getLevelsQuery.error);
    if (getUserQuery.isError) console.error(getUserQuery.error);
  }, [getLevelsQuery.isError, getUserQuery.isError]);

  if (loading) {
    return (
      <section className="min-h-svh flex justify-center items-center">
        <Spinner />
      </section>
    );
  }

  if (!getUserQuery.isSuccess || !getUserQuery.data) {
    return (
      <section
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
        className="min-h-svh flex justify-center items-center text-muted-foreground"
      >
        {t("you_should_login")}
      </section>
    );
  }

  const currentLevelName = (getUserQuery.data.level?.name || "").toLowerCase();
  const currentLevelId = Number(getUserQuery.data.level?.id || 1);
  const currentColor = COLORSLIST[Math.max(0, currentLevelId - 1)] || "#FFD700";

  const nextGoal = nextLevel?.max ?? null;
  const remaining =
    nextGoal != null ? Math.max(0, Number(nextGoal) - Number(userProgress)) : 0;

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background"
    >
      <main className="container min-h-svh mx-auto px-4 py-8">
        {/* Header (V2-ish) */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_home") || "العودة للرئيسية"}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {t("levels") || "المستويات"}
            </span>
          </div>
        </div>

        {/* Current level card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${currentColor}22` }}
            >
              <IoDiamond className="h-8 w-8" style={{ color: currentColor }} />
            </div>

            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {t("your_level") || "مستواك الحالي"}
              </p>
              <h1 className="mt-1 font-orbitron text-2xl font-black text-foreground capitalize">
                {currentLevelName}
              </h1>

              <p className="mt-2 text-xs text-muted-foreground">
                {t("progress") || "التقدم"}:{" "}
                <span className="font-semibold text-foreground">
                  {Number(userProgress).toFixed(2)} USD
                </span>
                {nextGoal != null ? (
                  <>
                    {" "}
                    • {t("next_goal") || "الهدف التالي"}:{" "}
                    <span className="font-semibold text-foreground">
                      {Number(nextGoal).toFixed(2)} USD
                    </span>{" "}
                    • {t("remaining") || "المتبقي"}:{" "}
                    <span className="font-semibold text-primary">
                      {remaining.toFixed(2)} USD
                    </span>
                  </>
                ) : (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-semibold text-primary">
                      {t("max_level") || "أعلى مستوى"}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Levels list (V2 cards) */}
        <div className="space-y-4">
          {tiers.map(({ lvl, prevMax, progress, isUnlocked }) => {
            const lvlColor = COLORSLIST[Math.max(0, Number(lvl.id) - 1)] || "#FFD700";
            const isCurrent = lvl.name?.toLowerCase() === currentLevelName;
            const isNext = nextLevel?.id === lvl.id;

            return (
              <div
                key={lvl.id}
                className={[
                  "flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors sm:flex-row sm:items-center sm:justify-between",
                  isCurrent ? "border-primary/40" : "border-border hover:border-primary/30",
                  !isUnlocked ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ backgroundColor: `${lvlColor}22` }}
                  >
                    {isUnlocked ? (
                      <IoDiamond className="h-8 w-8" style={{ color: lvlColor }} />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-foreground capitalize">
                      {lvl.name} {t("level") || "Level"}
                      {isCurrent ? (
                        <span className="ms-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {t("current") || "الحالي"}
                        </span>
                      ) : null}
                      {isNext && !isCurrent ? (
                        <span className="ms-2 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {t("next") || "التالي"}
                        </span>
                      ) : null}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {t("tier_range") || "نطاق المستوى"}:{" "}
                      <span className="font-semibold text-foreground">
                        {Number(prevMax).toFixed(2)}
                      </span>{" "}
                      →{" "}
                      <span className="font-semibold text-foreground">
                        {Number(lvl.max).toFixed(2)}
                      </span>{" "}
                      USD
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-[320px]">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t("progress") || "التقدم"}:{" "}
                      <span className="font-semibold text-foreground">
                        {progress}%
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.min(Number(userProgress), Number(lvl.max)).toFixed(2)} /{" "}
                      {Number(lvl.max).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-2.5 rounded-full bg-primary transition-all"
                      style={{ width: `${isUnlocked ? progress : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}