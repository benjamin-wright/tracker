export default class LocalStorageMock {
    private store: {[key: string]: string};

    constructor() {
      this.store = {};
    }
  
    clear() {
      this.store = {};
    }
  
    getItem(key: string): string | null {
      return this.store[key] || null;
    }
  
    setItem(key: string, value: string | Object) {
      this.store[key] = String(value);
    }
  
    removeItem(key: string) {
      delete this.store[key];
    }

    key(index: number): string | null {
        return Object.keys(this.store)[index] || null;
    }

    get length(): number {
        return Object.keys(this.store).length;
    }
}