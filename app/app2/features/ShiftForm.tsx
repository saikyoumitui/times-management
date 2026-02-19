"use client";
import React from "react";
import type { Employee } from "./store";

interface FormState {
  newName: string;
  newWage: number;
  employeeId: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
}

export function ShiftForm(props: {
  employees: Employee[];
  selectedDate: string;
  form: FormState;
 // setForm: React.Dispatch<React.SetStateAction<any>>;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  addEmployee: () => void;
  deleteEmployee: (id: string) => void;
  loadExistingToForm: () => void;
  saveShift: () => void;
}) {
  const f = props.form;

  return (
    <div className="stack">
      <div className="row">
        <h2 className="h2">勤務者の追加（登録順）</h2>
      </div>

      <div className="row">
        <input className="input" placeholder="勤務者名" value={f.newName} onChange={(e) => props.setForm((p: FormState) => ({ ...p, newName: e.target.value }))} />
        <input className="input" type="number" min={1} value={f.newWage} onChange={(e) => props.setForm((p: FormState) => ({ ...p, newWage: Number(e.target.value) }))} />
        <button className="btn primary" onClick={props.addEmployee}>追加</button>
      </div>

      <hr className="hr" />

      <div className="row">
        <h2 className="h2">勤務実績入力（{props.selectedDate}）</h2>
      </div>

      <div className="row">
        <select className="input" value={f.employeeId} onChange={(e) => props.setForm((p: FormState) => ({ ...p, employeeId: e.target.value }))}>
          <option value="">勤務者を選択</option>
          {props.employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <input className="input" type="time" value={f.clockIn} onChange={(e) => props.setForm((p: FormState) => ({ ...p, clockIn: e.target.value }))} />
        <input className="input" type="time" value={f.clockOut} onChange={(e) => props.setForm((p: FormState) => ({ ...p, clockOut: e.target.value }))} />
        <input className="input" type="number" min={0} value={f.breakMinutes} onChange={(e) => props.setForm((p: FormState) => ({ ...p, breakMinutes: Number(e.target.value) }))} />

        <button className="btn" onClick={props.loadExistingToForm}>既存を読込</button>
        <button className="btn" onClick={props.saveShift}>保存</button>
      </div>

      {props.employees.length > 0 && (
        <div className="hint">
          退勤が出勤より早い時刻なら「翌日退勤」として扱います（日跨ぎOK）
        </div>
      )}
    </div>
  );
}
