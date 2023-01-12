export interface Lazy<T> {
	(): T;
	isLazy: boolean;
  };
  
export default function lazy<T>(getter: () => T): Lazy<T> {
	let evaluated: boolean = false;
	let _res: T | null = null;

	const res = <Lazy<T>>function (): T {
		if (evaluated)
			return _res as T;

		_res = getter();
		
		evaluated = true;
		return _res;
	}

	res.isLazy = true;

	return res;
};