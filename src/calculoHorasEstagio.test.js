import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularHorasEstagio } from './calculoHorasEstagio.js';

test('reproduz os quatro valores aprovados para salário 700 e tempo 00,52', () => {
  for (const [percentual, esperado] of [[0, 3.03], [50, 4.54], [60, 4.84], [100, 6.06]]) {
    assert.equal(calcularHorasEstagio('700', '00,52', percentual), esperado);
  }
});

test('usa tempo decimal e corta a base antes de aplicar o adicional', () => {
  assert.equal(calcularHorasEstagio('700', '01,30'), 7.58);
  assert.equal(calcularHorasEstagio('700', '01,30', 50), 11.37);
  assert.equal(calcularHorasEstagio('700', '00:52', 60), 4.84);
});

test('preserva centavos exatos e elimina somente casas posteriores', () => {
  assert.equal(calcularHorasEstagio('1200', '00,29'), 2.90);
  assert.equal(calcularHorasEstagio('1200', '00,29', 100), 5.80);
  assert.equal(calcularHorasEstagio('1234.56', '01,30'), 13.37);
  assert.equal(calcularHorasEstagio('1234.56', '01,30', 60), 21.39);
  assert.equal(calcularHorasEstagio('700', '00,00', 50), 0);
  assert.equal(calcularHorasEstagio('0', '00,52'), 0);
  assert.equal(calcularHorasEstagio('7e2', '00,52'), 3.03);
});
