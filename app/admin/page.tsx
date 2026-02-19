"use client";
import "./admin.css";
import { Calendar } from "@/app/app2/features/Calendar";
import { ShiftForm } from "@/app/app2/features/ShiftForm";
import { EmployeeTable } from "@/app/app2/features/EmployeeTable";
import { useAdminStore } from "@/app/app2/features/store";

export default function AdminPage() {
  const s = useAdminStore();

  return (
    <main className="wrap">
      <header className="header">
        <h1 className="title">管理者画面</h1>
        <div className="sub">カレンダーで日付を選択 → 従業員（登録順）を表示</div>
      </header>

      <section className="card">
        <Calendar
          viewMonth={s.viewMonth}
          selectedDate={s.selectedDate}
          onPrev={s.prevMonth}
          onNext={s.nextMonth}
          onToday={s.goToday}
          onSelectDate={s.setSelectedDate}
          hasData={s.hasAnyShiftOn}
        />
      </section>

      {s.error && <div className="error">{s.error}</div>}

      <section className="card">
        <ShiftForm
          employees={s.employees}
          selectedDate={s.selectedDate}
          form={s.form}
          setForm={s.setForm}
          addEmployee={s.addEmployee}
          deleteEmployee={s.deleteEmployee}
          loadExistingToForm={s.loadExistingShiftToForm}
          saveShift={s.upsertShift}
        />
      </section>

      <section className="card tableCard">
        <EmployeeTable
          employees={s.employees}
          shifts={s.shifts}
          selectedDate={s.selectedDate}
          onDeleteShift={s.deleteShift}
          onDeleteEmployee={s.deleteEmployee}
        />
      </section>

      <footer className="foot">
        ※ 日跨ぎは<strong>出勤日計上（A方式）</strong>／給料は<strong>1分単位</strong>（円は切り捨て）
      </footer>
    </main>
  );
}
