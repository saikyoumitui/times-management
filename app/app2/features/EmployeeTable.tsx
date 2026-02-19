"use client";
import React, { useMemo } from "react";
import type { Employee, Shift } from "./store";
import { fmtHM, fmtYen, parseTimeToMinutes, wageYen, workMinutes } from "./calc";

const monthKeyFromYMD = (date: string): string => date.substring(0, 7);

export function EmployeeTable(props: {
  employees: Employee[];
  shifts: Shift[];
  selectedDate: string;
  onDeleteShift: (employeeId: string, date: string) => void;
  onDeleteEmployee: (id: string) => void;
}) {
  const selectedMonth = monthKeyFromYMD(props.selectedDate);

  const shiftMap = useMemo(() => {
    const m = new Map<string, Shift>();
    for (const s of props.shifts) m.set(`${s.employeeId}|${s.date}`, s);
    return m;
  }, [props.shifts]);

  const rows = useMemo(() => {
    return props.employees.map((emp) => {
      const dayShift = shiftMap.get(`${emp.id}|${props.selectedDate}`);
      const dayMin = dayShift ? workMinutes(dayShift.clockIn, dayShift.clockOut, dayShift.breakMinutes) : 0;
      const dayPay = wageYen(dayMin, emp.hourlyWage);

      const monthMin = props.shifts
        .filter((s) => s.employeeId === emp.id && monthKeyFromYMD(s.date) === selectedMonth)
        .reduce((sum, s) => sum + workMinutes(s.clockIn, s.clockOut, s.breakMinutes), 0);

      const monthPay = wageYen(monthMin, emp.hourlyWage);

      return { emp, dayShift, dayMin, dayPay, monthMin, monthPay };
    });
  }, [props.employees, props.shifts, props.selectedDate, selectedMonth, shiftMap]);

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>勤務者</th>
            <th>日付</th>
            <th className="r">日次 実働</th>
            <th className="r">日次 給料</th>
            <th className="r">月合計 実働</th>
            <th className="r">月合計 給料</th>
            <th className="r">時給</th>
            <th className="r">勤務実績</th>
            <th className="r">操作</th>
          </tr>
        </thead>

        <tbody>
          {props.employees.length === 0 ? (
            <tr><td colSpan={9} className="empty">勤務者を追加してください</td></tr>
          ) : (
            rows.map((r) => {
              const sh = r.dayShift;
              const overnight = sh ? parseTimeToMinutes(sh.clockOut) <= parseTimeToMinutes(sh.clockIn) : false;

              return (
                <tr key={r.emp.id}>
                  <td className="bold">{r.emp.name}</td>
                  <td>{props.selectedDate}</td>
                  <td className="r">{fmtHM(r.dayMin)}</td>
                  <td className="r">{fmtYen(r.dayPay)}</td>
                  <td className="r">{fmtHM(r.monthMin)}</td>
                  <td className="r">{fmtYen(r.monthPay)}</td>
                  <td className="r">{fmtYen(r.emp.hourlyWage)}</td>

                  <td className="r mono">
                    {sh ? (
                      <>
                        {sh.clockIn}–{sh.clockOut}{overnight && <span className="badge">翌日</span>}
                        {" "}休憩{sh.breakMinutes}m
                        <button className="btn xs" onClick={() => props.onDeleteShift(r.emp.id, props.selectedDate)}>その日削除</button>
                      </>
                    ) : (
                      <span className="dimText">未入力</span>
                    )}
                  </td>

                  <td className="r">
                    <button className="btn danger xs" onClick={() => props.onDeleteEmployee(r.emp.id)}>勤務者削除</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
