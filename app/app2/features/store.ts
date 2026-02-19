"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, buildMonthCells, monthKeyFromYMD, todayYMD_JST } from "./Calendar";

export type Employee = {
  id: string;
  name: string;
  hourlyWage: number; // DBで使うなら保持（フロントで計算はしない）
  createdAt: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD（出勤日＝A方式）
  clockIn: string; // HH:mm
  clockOut: string; // HH:mm（日跨ぎでもOK：計算しないので許容）
  breakMinutes: number; // 合計（分）
};

type StoreData = {
  employees: Employee[];
  shifts: Shift[];
};

type FormState = {
  // 従業員追加
  newName: string;
  newWage: number;

  // 勤務入力
  employeeId: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
};

const KEY = "attendance_admin_mock_compact_v1";
const uid = () => crypto.randomUUID();

function safeLoad(): StoreData {
  if (typeof window === "undefined") return { employees: [], shifts: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { employees: [], shifts: [] };
    const p = JSON.parse(raw) as Partial<StoreData>;
    return {
      employees: Array.isArray(p.employees) ? (p.employees as Employee[]) : [],
      shifts: Array.isArray(p.shifts) ? (p.shifts as Shift[]) : [],
    };
  } catch {
    return { employees: [], shifts: [] };
  }
}

function safeSave(data: StoreData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function useAdminStore() {
  // 初期データは1回だけ読む（useEffectでの初期setStateを避ける）
  const [initial] = useState<StoreData>(() => safeLoad());

  const [employees, setEmployees] = useState<Employee[]>(initial.employees);
  const [shifts, setShifts] = useState<Shift[]>(initial.shifts);

  const [selectedDate, setSelectedDate] = useState<string>(todayYMD_JST());
  const [viewMonth, setViewMonth] = useState<string>(monthKeyFromYMD(todayYMD_JST()));
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(() => ({
    newName: "",
    newWage: 1200,
    employeeId: initial.employees[0]?.id ?? "",
    clockIn: "09:00",
    clockOut: "18:00",
    breakMinutes: 60,
  }));

  // localStorageへ保存（仮）※DB連携後はここをAPIに置換
  useEffect(() => {
    safeSave({ employees, shifts });
  }, [employees, shifts]);

  // 選択日が変わったら表示月も追従
  /*
  useEffect(() => {
    const ym = monthKeyFromYMD(selectedDate);
    if (ym !== viewMonth) setViewMonth(ym);
  }, [selectedDate, viewMonth]);
*/
  const handleSelectDate = (ymd: string) => {
    setSelectedDate(ymd);
  
    // 日付が変わったら、その日付の属する月を表示月にセットする
    const ym = monthKeyFromYMD(ymd);
    if (ym !== viewMonth) {
      setViewMonth(ym);
    }
  };
  // Calendar側が使う場合に備えて保持（page.tsxでは未使用でもOK）
  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);

  // カレンダーの●表示用：その日付に1件でもshiftがあるか
  const hasAnyShiftOn = (ymd: string) => shifts.some((s) => s.date === ymd);

  // ====== カレンダー操作（page.tsxが参照する名前） ======
  const prevMonth = () => setViewMonth((m) => addMonths(m, -1));
  const nextMonth = () => setViewMonth((m) => addMonths(m, 1));
  const goToday = () => {
    const t = todayYMD_JST();
    setSelectedDate(t);
    setViewMonth(monthKeyFromYMD(t));
  };

  // ====== 従業員 ======
  const addEmployee = () => {
    setError(null);

    const name = form.newName.trim();
    const wage = Number(form.newWage);

    if (!name) return setError("勤務者名を入力してください");
    if (!Number.isFinite(wage) || wage <= 0) return setError("時給は1以上で入力してください");

    const emp: Employee = {
      id: uid(),
      name,
      hourlyWage: Math.floor(wage),
      createdAt: new Date().toISOString(),
    };

    // 登録順を維持
    setEmployees((p) => [...p, emp]);

    // 追加後、employeeIdが空なら自動選択
    setForm((f) => ({
      ...f,
      newName: "",
      newWage: 1200,
      employeeId: f.employeeId || emp.id,
    }));
  };

  const deleteEmployee = (id: string) => {
    setError(null);
    if (!confirm("勤務者を削除しますか？（その人の勤務実績も削除されます）")) return;

    setEmployees((p) => p.filter((e) => e.id !== id));
    setShifts((p) => p.filter((s) => s.employeeId !== id));

    setForm((f) => (f.employeeId === id ? { ...f, employeeId: "" } : f));
  };

  // ====== 勤務実績（選択日） ======
  const upsertShift = () => {
    setError(null);

    const employeeId = form.employeeId;
    if (!employeeId) return setError("勤務者を選択してください");

    // 計算はDB側でやるので、最小限の入力チェックだけ
    if (!form.clockIn) return setError("出勤時刻を入力してください");
    if (!form.clockOut) return setError("退勤時刻を入力してください");
    if (form.breakMinutes < 0) return setError("休憩分は0以上にしてください");

    const existing = shifts.find((s) => s.employeeId === employeeId && s.date === selectedDate);

    if (existing) {
      setShifts((p) =>
        p.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                clockIn: form.clockIn,
                clockOut: form.clockOut,
                breakMinutes: Math.floor(form.breakMinutes),
              }
            : s
        )
      );
    } else {
      const sh: Shift = {
        id: uid(),
        employeeId,
        date: selectedDate,
        clockIn: form.clockIn,
        clockOut: form.clockOut,
        breakMinutes: Math.floor(form.breakMinutes),
      };
      setShifts((p) => [...p, sh]);
    }
  };

  const deleteShift = (employeeId: string, date: string) => {
    setError(null);
    setShifts((p) => p.filter((s) => !(s.employeeId === employeeId && s.date === date)));
  };

  const loadExistingShiftToForm = () => {
    setError(null);

    const employeeId = form.employeeId;
    if (!employeeId) return setError("勤務者を選択してください");

    const existing = shifts.find((s) => s.employeeId === employeeId && s.date === selectedDate);
    if (!existing) return setError("その日の勤務実績が見つかりません");

    setForm((f) => ({
      ...f,
      clockIn: existing.clockIn,
      clockOut: existing.clockOut,
      breakMinutes: existing.breakMinutes,
    }));
  };

  // page.tsx が使う形で返す
  return {
    // data
    employees,
    shifts,
    selectedDate,
    viewMonth,
    monthCells, // 使わなければ無視でOK
    error,

    // form
    form,
    setForm,

    // calendar actions (page.tsxのprops名に合わせた)
    setSelectedDate: handleSelectDate,
    prevMonth,
    nextMonth,
    goToday,
    hasAnyShiftOn,

    // crud
    addEmployee,
    deleteEmployee,
    upsertShift,
    deleteShift,
    loadExistingShiftToForm,
  };
}
