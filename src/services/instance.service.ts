import {Service} from "typedi";

type InstanceMap<T> = Map<string, T>

type ClassMap<T> = WeakMap<InstanceClassType<T>, InstanceMap<T>>

export interface InstanceClassType<T> {
    new (): T;
}

@Service()
export class InstanceService {

    private map: ClassMap<any> = new WeakMap();

    public getUniqueInstance<T>(Class: InstanceClassType<T>, id: string): T {
        const instanceMap = this.getInstanceMap(Class);
        const instance = instanceMap.get(id);
        if (instance) {
            return instance;
        } else {
            const newInstance = this.getNewInstance(Class);
            instanceMap.set(id, newInstance);
            return newInstance;
        }
    }

    public getNewInstance<T>(Class: InstanceClassType<T>): T {
        return new Class();
    }

    private getInstanceMap<T>(Class: InstanceClassType<T>): InstanceMap<T> {
        const instanceMap = this.map.get(Class);
        if (instanceMap) {
            return instanceMap;
        } else {
            this.map.set(Class, new Map());
            return this.getInstanceMap(Class);
        }
    }

}