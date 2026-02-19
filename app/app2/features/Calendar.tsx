"use client";
import React, { useMemo } from "react";

/**
 * 今日の日付を yyyy-mm-dd 形式で取得 (JST)
 */
export function todayYMD_JST(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${date}`;
}
/**
 * 指定した yyyy-mm 形式の文字列に月を加減算する
 */
export function addMonths(yearMonth: string, diff: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  // Dateオブジェクトの月は0始まりなので m-1。そこにdiffを加算
  const d = new Date(y, m - 1 + diff, 1);
  const nextY = d.getFullYear();
  const nextM = String(d.getMonth() + 1).padStart(2, "0");
  return `${nextY}-${nextM}`;
}
/**
 * カレンダーのグリッド（前後月を含む42マス）を生成する
 */
export function buildMonthCells(viewMonth: string): { ymd: string; inMonth: boolean }[] {
  const [y, m] = viewMonth.split("-").map(Number);
  const firstDate = new Date(y, m - 1, 1);
  
  // 月曜日始まりにするための調整 (0:日 ~ 6:土)
  let startDayShift = firstDate.getDay() - 1;
  if (startDayShift < 0) startDayShift = 6; 

  const startDate = new Date(y, m - 1, 1 - startDayShift);
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, "0");
    const dStr = String(d.getDate()).padStart(2, "0");
    const ymd = `${yStr}-${mStr}-${dStr}`;

    cells.push({
      ymd,
      inMonth: ymd.startsWith(viewMonth),
    });
  }
  return cells;
}
/**
 * yyyy-mm-dd 形式から yyyy-mm 形式（月のキー）を抽出
 * 例: "2026-02-19" -> "2026-02"
 */
export function monthKeyFromYMD(ymd: string): string {
  // 文字列の先頭から7文字分（年4桁 + ハイフン1桁 + 月2桁）を切り出します
  return ymd.slice(0, 7);
}

export function Calendar(props: {
  viewMonth: string;
  selectedDate: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (ymd: string) => void;
  hasData: (ymd: string) => boolean;
}) {
  const cells = useMemo(() => buildMonthCells(props.viewMonth), [props.viewMonth]);
  const week = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div>
      <div className="calTop">
        <div className="calTitle">
          {props.viewMonth}
          <span className="calSel">選択：{props.selectedDate}</span>
        </div>
        <div className="calBtns">
          <button className="btn" onClick={props.onPrev}>← 前月</button>
          <button className="btn primary" onClick={props.onToday}>今日</button>
          <button className="btn" onClick={props.onNext}>次月 →</button>
        </div>
      </div>

      <div className="calGrid">
        {week.map((w) => (
          <div key={w} className="calWeek">{w}</div>
        ))}

        {cells.map((c: { ymd: string; inMonth: boolean }) => {
          const sel = c.ymd === props.selectedDate;
          const mark = props.hasData(c.ymd);
          const dayNum = Number(c.ymd.slice(8, 10));
          return (
            <button
              key={c.ymd}
              className={`calCell ${sel ? "sel" : ""} ${c.inMonth ? "" : "dim"}`}
              onClick={() => props.onSelectDate(c.ymd)}
              title={c.ymd}
            >
              <span className="calNum">{dayNum}</span>
              {mark && <span className={`dot ${sel ? "dotInv" : ""}`} />}
            </button>
          );
        })}
      </div>

      <div className="hint">● は勤務実績入力済み</div>
    </div>
  );
}


