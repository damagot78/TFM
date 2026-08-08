import { describe, expect, it } from 'vitest'
import type { ExtraId } from '../../shared/types/catalog'
import {
  getBlockingGroupSelection,
  getExtraOrThrow,
  isExtraAllowedForAge,
  isExtraAllowedForModality,
} from './extrasCatalog'

describe('getExtraOrThrow', () => {
  it('devuelve el extra del catálogo para un id válido', () => {
    expect(getExtraOrThrow('locker').name).toBe('Alquiler de Taquilla')
  })

  it('lanza un error si el id no existe en el catálogo', () => {
    expect(() => getExtraOrThrow('not-a-real-extra' as ExtraId)).toThrow()
  })
})

describe('isExtraAllowedForModality', () => {
  it('un extra sin grupo se permite en cualquier modalidad', () => {
    expect(isExtraAllowedForModality(getExtraOrThrow('locker'), 'pp')).toBe(true)
  })

  it('un extra del grupo buggy no se permite en modalidades sin instalaciones', () => {
    expect(isExtraAllowedForModality(getExtraOrThrow('buggy_annual'), 'pp')).toBe(false)
    expect(isExtraAllowedForModality(getExtraOrThrow('buggy_annual'), 'sm')).toBe(true)
  })
})

describe('isExtraAllowedForAge', () => {
  it('un extra sin restricción de edad se permite a cualquier edad', () => {
    expect(isExtraAllowedForAge(getExtraOrThrow('locker'), 5)).toBe(true)
    expect(isExtraAllowedForAge(getExtraOrThrow('locker'), null)).toBe(true)
  })

  it('un extra del grupo buggy requiere al menos 16 años, edad conocida', () => {
    expect(isExtraAllowedForAge(getExtraOrThrow('buggy_annual'), 15)).toBe(false)
    expect(isExtraAllowedForAge(getExtraOrThrow('buggy_annual'), 16)).toBe(true)
    expect(isExtraAllowedForAge(getExtraOrThrow('buggy_annual'), null)).toBe(false)
  })
})

describe('getBlockingGroupSelection', () => {
  it('devuelve vacío si no hay otro extra del mismo grupo seleccionado', () => {
    expect(getBlockingGroupSelection('club_storage', ['locker'])).toEqual([])
  })

  it('devuelve los extras ya seleccionados del mismo grupo', () => {
    expect(getBlockingGroupSelection('club_storage', ['storage_trolley'])).toEqual(['storage_trolley'])
  })

  it('no se bloquea a sí mismo si ya está seleccionado', () => {
    expect(getBlockingGroupSelection('club_storage', ['club_storage'])).toEqual([])
  })
})
