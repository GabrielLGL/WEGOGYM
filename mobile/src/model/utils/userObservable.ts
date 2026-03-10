import { map } from 'rxjs/operators'
import { database } from '../index'
import User from '../models/User'

/** Reactive observable — User | null. For withObservables. */
export function observeCurrentUser() {
  return database.get<User>('users').query().observe().pipe(
    map((list: User[]) => list[0] || null)
  )
}

/** Async fetch — User | null. For imperative code. */
export async function fetchCurrentUser(): Promise<User | null> {
  const users = await database.get<User>('users').query().fetch()
  return users[0] || null
}
