// tslint:disable: no-unsafe-any
import { IKeyValueStoreSync } from "@konceiver/kv";
import lowdb from "lowdb";
// tslint:disable-next-line: no-submodule-imports
import FileSync from "lowdb/adapters/FileSync";

export class StoreSync<K, T> implements IKeyValueStoreSync<K, T> {
	private constructor(private readonly store: lowdb.LowdbSync<any>) {}

	public static new<K, T>(file: string): StoreSync<K, T> {
		return new StoreSync<K, T>(lowdb(new FileSync(file)));
	}

	public all(): [K, T][] {
		return [...this.store.entries().values()];
	}

	public keys(): K[] {
		return [...this.store.keys().value()];
	}

	public values(): T[] {
		return [...this.store.values().values()];
	}

	public get(key: K): T | undefined {
		return this.store.get(key).value();
	}

	public getMany(keys: K[]): (T | undefined)[] {
		return [...keys].map((key: K) => this.get(key));
	}

	public pull(key: K): T | undefined {
		const item: T | undefined = this.get(key);

		this.forget(key);

		return item;
	}

	public pullMany(keys: K[]): (T | undefined)[] {
		const items: (T | undefined)[] = this.getMany(keys);

		this.forgetMany(keys);

		return items;
	}

	public put(key: K, value: T): boolean {
		this.store.set(key, value).write();

		return this.has(key);
	}

	public putMany(values: [K, T][]): boolean[] {
		return values.map((value: [K, T]) => this.put(value[0], value[1]));
	}

	public has(key: K): boolean {
		return this.store.has(key).value();
	}

	public hasMany(keys: K[]): boolean[] {
		return [...keys].map((key: K) => this.has(key));
	}

	public missing(key: K): boolean {
		return !this.has(key);
	}

	public missingMany(keys: K[]): boolean[] {
		return [...keys].map((key: K) => this.missing(key));
	}

	public forget(key: K): boolean {
		if (!this.has(key)) {
			return false;
		}

		this.store.unset(key).write();

		return !this.has(key);
	}

	public forgetMany(keys: K[]): boolean[] {
		return [...keys].map((key: K) => this.forget(key));
	}

	public flush(): boolean {
		this.store.setState({});

		return this.count() === 0;
	}

	public count(): number {
		return this.store.size().value();
	}

	public isEmpty(): boolean {
		return this.count() === 0;
	}

	public isNotEmpty(): boolean {
		return !this.isEmpty();
	}
}
