const instanceCache = new Map<string, InstanceWithId>();

interface InstVarsId {
    id: string;
}

interface InstanceWithId extends IWorldInstance {
    instVars: InstVarsId;
}

export function findInstanceById<Type extends InstanceWithId>(objects: IObjectClass<Type>, id: string): (Type | null) {
    const key = `${objects.name} ${id}`;

    if (!instanceCache.has(key)) {
        const instance = objects.getAllInstances().find(
            (i) => i.instVars.id === id
        );

        if (!instance) {
            return null;
        }

        instanceCache.set(key, instance);
        instance.addEventListener("destroy", () => {
            instanceCache.delete(key);
        })
    }

    return instanceCache.get(key) as Type;
}
