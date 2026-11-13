import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularRecessoEstagio } from './calculoRecessoEstagio.js';

test('reproduz os exemplos aprovados e o limite de 15 dias no mês final', () => {
  assert.deepEqual(calcularRecessoEstagio('700', '2026-01-01', '2026-05-01'), { meses: 4, valor: 233.33 });
  assert.deepEqual(calcularRecessoEstagio('700', '2026-01-01', '2026-05-14'), { meses: 4, valor: 233.33 });
  assert.deepEqual(calcularRecessoEstagio('700', '2026-01-01', '2026-05-15'), { meses: 5, valor: 291.67 });
});

test('conta os meses a partir do dia inicial e a fração a partir do aniversário', () => {
  assert.equal(calcularRecessoEstagio('1200', '2026-01-15', '2026-02-15').meses, 1);
  assert.equal(calcularRecessoEstagio('1200', '2026-01-15', '2026-05-15').meses, 4);
  assert.equal(calcularRecessoEstagio('1200', '2026-01-15', '2026-05-28').meses, 4);
  assert.equal(calcularRecessoEstagio('1200', '2026-01-15', '2026-05-29').meses, 5);
});

test('lida com fim de mês, ano bissexto e mudança de ano sem deslocar o dia original', () => {
  assert.equal(calcularRecessoEstagio('1200', '2026-01-31', '2026-02-28').meses, 1);
  assert.equal(calcularRecessoEstagio('1200', '2026-01-31', '2026-03-31').meses, 2);
  assert.equal(calcularRecessoEstagio('1200', '2024-01-31', '2024-02-29').meses, 1);
  assert.equal(calcularRecessoEstagio('1200', '2025-11-15', '2026-03-15').meses, 4);
});

test('não inclui períodos vazios ou invertidos e respeita o limite inicial de 15 dias', () => {
  assert.equal(calcularRecessoEstagio('700', '', '2026-01-15'), null);
  assert.equal(calcularRecessoEstagio('700', '2026-02-01', '2026-01-15'), null);
  assert.equal(calcularRecessoEstagio('700', '2026-01-01', '2026-01-01').meses, 0);
  assert.equal(calcularRecessoEstagio('700', '2026-01-01', '2026-01-14').meses, 0);
  assert.equal(calcularRecessoEstagio('700', '2026-01-01', '2026-01-15').meses, 1);
});
