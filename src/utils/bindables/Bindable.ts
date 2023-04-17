import { WeakList } from "../lists/WeakList";
import { ValueChangedEvent } from "./ValueChangedEvent";

//#region Main bindable class

/**
 * A utility class for distributing data between components.
 */
export class Bindable<T> {
    private _value: T;
    private _defaultValue: T;
    private _disabled: boolean = false;

    /**
     * All events which are raised when the value of this `Bindable` has changed
     * (or manually via `triggerValueChange`).
     */
    protected readonly _valueChanged: ValueChangedEvent<T>[] = [];

    /**
     * All events which are raised when the value of this `Bindable` has changed
     * (or manually via `triggerValueChange`).
     */
    get valueChanged(): readonly ValueChangedEvent<T>[] {
        return this._valueChanged;
    }

    /**
     * All events which are raised when the disabled state of this `Bindable`
     * has been changed (or manually via `triggerDisabledChange`).
     */
    protected readonly _disabledChanged: ValueChangedEvent<boolean>[] = [];

    /**
     * All events which are raised when the disabled state of this `Bindable`
     * has been changed (or manually via `triggerDisabledChange`).
     */
    get disabledChanged(): readonly ValueChangedEvent<boolean>[] {
        return this._disabledChanged;
    }

    /**
     * All events which is raised when the default value of this `Bindable`
     * has changed (or manually via `triggerDefaultChange`).
     */
    protected readonly _defaultChanged: ValueChangedEvent<T>[] = [];

    /**
     * All events which is raised when the default value of this `Bindable`
     * has changed (or manually via `triggerDefaultChange`).
     */
    get defaultChanged(): readonly ValueChangedEvent<T>[] {
        return this._defaultChanged;
    }

    /**
     * Whether this `Bindable` has been disabled. When disabled, attempting to change
     * the value of this `Bindable` will throw an error.
     */
    get disabled(): boolean {
        return this._disabled;
    }

    /**
     * Whether this `Bindable` has been disabled. When disabled, attempting to change
     * the value of this `Bindable` will throw an error.
     */
    set disabled(value: boolean) {
        // If a lease is active, disabled can only be changed by that leased bindable.
        this.throwIfLeased();

        if (this._disabled === value) {
            return;
        }

        this.setDisabled(value);
    }

    protected setDisabled(
        value: boolean,
        bypassChecks?: boolean,
        source?: Bindable<T>
    ): void {
        if (!bypassChecks) {
            this.throwIfLeased();
        }

        const prev: boolean = this._disabled;

        this._disabled = value;

        this.triggerDisabledChange(prev, source ?? this, true, bypassChecks);
    }

    /**
     * Whether the current value is equal to the default value.
     */
    get isDefault(): boolean {
        return this._value === this._defaultValue;
    }

    /**
     * Revert the current value to the defined default value.
     */
    setDefault(): void {
        this.value = this._defaultValue;
    }

    /**
     * The current value of this `Bindable`.
     */
    get value(): T {
        return this._value;
    }

    /**
     * The current value of this `Bindable`.
     */
    set value(value: T) {
        // Intentionally don't have throwIfLeased() here.
        // If the leased bindable decides to disable exclusive access (by disabling this bindable), anything will be able to overwrite the value.
        if (this.disabled) {
            throw new Error("Can not set value as bindable is disabled.");
        }

        if (this._value === value) {
            return;
        }

        this.setValue(this._value, value);
    }

    protected setValue(
        previousValue: T,
        value: T,
        bypassChecks?: boolean,
        source?: Bindable<T>
    ): void {
        this._value = value;
        this.triggerValueChange(
            previousValue,
            source ?? this,
            true,
            bypassChecks
        );
    }

    /**
     * The default value of this `Bindable`. Used when calling `setDefault` or querying `isDefault`.
     */
    get defaultValue(): T {
        return this._defaultValue;
    }

    /**
     * The default value of this `Bindable`. Used when calling `setDefault` or querying `isDefault`.
     */
    set defaultValue(value: T) {
        // Intentionally don't have throwIfLeased() here.
        // If the leased bindable decides to disable exclusive access (by disabling this bindable), anything will be able to overwrite the value.
        if (this.disabled) {
            throw new Error(
                "Can not set default value as bindable is disabled."
            );
        }

        if (this._defaultValue === value) {
            return;
        }

        this.setDefaultValue(this._defaultValue, value);
    }

    protected setDefaultValue(
        previousValue: T,
        value: T,
        bypassChecks?: boolean,
        source?: Bindable<T>
    ): void {
        this._defaultValue = value;
        this.triggerDefaultChange(
            previousValue,
            source ?? this,
            true,
            bypassChecks
        );
    }

    /**
     * Creates a new `Bindable` instance initialized with a default value.
     *
     * @param value The initial and default value for this `Bindable`. Defaults to `null`.
     */
    constructor(value: T) {
        this._value = value;
        this._defaultValue = value;
    }

    protected bindings: WeakList<Bindable<T>> | null = null;

    /**
     * An alias to `bindTo` provided for use in object initializer scenarios.
     * Passes the provided value as the foreign (more permanent) `Bindable`.
     */
    set bindTarget(value: Bindable<T>) {
        this.bindTo(value);
    }

    /**
     * Copies all values and value limitations of this `Bindable` to another.
     *
     * @param them The target to copy to.
     */
    copyTo(them: Bindable<T>): void {
        them.value = this.value;
        them.defaultValue = this.defaultValue;
        them.disabled = this.disabled;
    }

    /**
     * Binds this `Bindable` to another such that bi-directional updates are propagated.
     * This will adopt any values and value limitations of the `Bindable` bound to.
     *
     * Will throw an error if the given `Bindable` is already bound.
     *
     * @param them The foreign `Bindable`. This should always be the most permanent end of the bind.
     */
    bindTo(them: Bindable<T>): void {
        if (this.bindings?.contains(them)) {
            throw new Error("An already bound bindable cannot be bound again.");
        }

        them.copyTo(this);

        this.addWeakReference(them);
        them.addWeakReference(this);
    }

    /**
     * Binds an event to `valueChanged` with the option of running the bound action once immediately.
     *
     * @param onChange The event to raise when the value of this `Bindable` changes.
     * @param runOnceImmediately Whether the action provided in `onChange` should be run once immediately.
     */
    bindValueChanged(
        onChange: ValueChangedEvent<T>,
        runOnceImmediately?: boolean
    ): void {
        this._valueChanged.push(onChange);

        if (runOnceImmediately) {
            onChange(this.value, this.value);
        }
    }

    /**
     * Unbinds an event from `valueChanged`.
     *
     * @param onChange The event to unbind.
     */
    unbindValueChanged(onChange: ValueChangedEvent<T>): void {
        this.removeEvent(onChange, this._valueChanged);
    }

    /**
     * Binds an event to `disabledChanged` with the option of running the bound action once immediately.
     *
     * @param onChange The event to raise when the disabled state of this `Bindable` changes.
     * @param runOnceImmediately Whether the action provided in `onChange` should be run once immediately.
     */
    bindDisabledChanged(
        onChange: ValueChangedEvent<boolean>,
        runOnceImmediately?: boolean
    ): void {
        this._disabledChanged.push(onChange);

        if (runOnceImmediately) {
            onChange(this.disabled, this.disabled);
        }
    }

    /**
     * Unbinds an event from `disabledChanged`.
     *
     * @param onChange The event to unbind.
     */
    unbindDisabledChanged(onChange: ValueChangedEvent<boolean>): void {
        this.removeEvent(onChange, this._disabledChanged);
    }

    /**
     * Binds an event to `defaultChanged` with the option of running the bound action once immediately.
     *
     * @param onChange The event to raise when the default value of this `Bindable` changes.
     * @param runOnceImmediately Whether the action provided in `onChange` should be run once immediately.
     */
    bindDefaultChanged(
        onChange: ValueChangedEvent<T>,
        runOnceImmediately?: boolean
    ): void {
        this._defaultChanged.push(onChange);

        if (runOnceImmediately) {
            onChange(this.defaultValue, this.defaultValue);
        }
    }

    /**
     * Unbinds an event from `defaultChanged`.
     *
     * @param onChange The event to unbind.
     */
    unbindDefaultChanged(onChange: ValueChangedEvent<T>): void {
        this.removeEvent(onChange, this._defaultChanged);
    }

    protected removeEvent<C>(
        event: ValueChangedEvent<C>,
        events: ValueChangedEvent<C>[]
    ): void {
        const index: number = events.indexOf(event);

        if (index !== -1) {
            events.splice(index, 1);
        }
    }

    private addWeakReference(reference: Bindable<T>): void {
        this.bindings ??= new WeakList();
        this.bindings.add(reference);
    }

    private removeWeakReference(reference: Bindable<T>): void {
        this.bindings?.remove(reference);
    }

    /**
     * Raise `valueChanged` and `disabledChanged` once, without any changes actually occurring.
     * This does not propagate to any outward bound `Bindable`s.
     */
    triggerChange(): void {
        this.triggerValueChange(this._value, this, false);
        this.triggerDisabledChange(this._disabled, this, false);
    }

    protected triggerValueChange(
        previousValue: T,
        source: Bindable<T>,
        propagateToBindings: boolean = true,
        bypassChecks?: boolean
    ): void {
        // Check a bound bindable hasn't changed the value again (it will fire its own event)
        const beforePropagation: T = this._value;

        if (propagateToBindings && this.bindings) {
            for (const b of this.bindings) {
                if (!b) {
                    continue;
                }

                if (b === source) {
                    continue;
                }

                b.setValue(previousValue, this._value, bypassChecks, this);
            }
        }

        if (beforePropagation === this._value) {
            for (const c of this._valueChanged) {
                c(previousValue, this._value);
            }
        }
    }

    protected triggerDefaultChange(
        previousValue: T,
        source: Bindable<T>,
        propagateToBindings: boolean = true,
        bypassChecks: boolean = false
    ): void {
        // Check a bound bindable hasn't changed the value again (it will fire its own event)
        const beforePropagation: T = this._defaultValue;

        if (propagateToBindings && this.bindings) {
            for (const b of this.bindings) {
                if (!b) {
                    continue;
                }

                if (b === source) {
                    continue;
                }

                b.setDefaultValue(
                    previousValue,
                    this._defaultValue,
                    bypassChecks,
                    this
                );
            }
        }

        if (beforePropagation === this._defaultValue) {
            for (const c of this._defaultChanged) {
                c(previousValue, this._defaultValue);
            }
        }
    }

    protected triggerDisabledChange(
        previousValue: boolean,
        source: Bindable<T>,
        propagateToBindings: boolean = true,
        bypassChecks?: boolean
    ): void {
        // Check a bound bindable hasn't changed the value again (it will fire its own event)
        const beforePropagation: boolean = this._disabled;

        if (propagateToBindings && this.bindings) {
            for (const b of this.bindings) {
                if (!b) {
                    continue;
                }

                if (b === source) {
                    continue;
                }

                b.setDisabled(this._disabled, bypassChecks, this);
            }
        }

        if (beforePropagation === this._disabled) {
            for (const c of this._disabledChanged) {
                c(previousValue, this._disabled);
            }
        }
    }

    /**
     * Unbinds any events bound to the value changed events.
     */
    unbindEvents(): void {
        this._valueChanged.length = 0;
        this._defaultChanged.length = 0;
        this._disabledChanged.length = 0;
    }

    /**
     * Removes all bound `Bindable`s via `getBoundCopy` or `bindTo`.
     */
    unbindBindings(): void {
        if (!this.bindings) {
            return;
        }

        for (const b of this.bindings) {
            if (b) {
                this.unbindFrom(b);
            }
        }
    }

    /**
     * Calls `unbindEvents` and `unbindBindings`. Also returns any active lease.
     */
    unbindAll(): void {
        this.unbindAllInternal();
    }

    protected unbindAllInternal(): void {
        if (this.isLeased) {
            this.leasedBindable?.return();
        }

        this.unbindEvents();
        this.unbindBindings();
    }

    /**
     * Unbinds this `Bindable` from another `Bindable` such that this `Bindable` stops receiving updates from it.
     * The other `Bindable` will also stop receiving events from this `Bindable`.
     *
     * @param them The other `Bindable`.
     */
    unbindFrom(them: Bindable<T>): void {
        this.removeWeakReference(them);
        them.removeWeakReference(this);
    }

    /**
     * Create an unbound clone of this `Bindable`.
     */
    getUnboundCopy(): Bindable<T> {
        const newBindable: Bindable<T> = this.createInstance();
        this.copyTo(newBindable);
        return newBindable;
    }

    /**
     * Creates a new instance of this `Bindable` for use in `getBoundCopy` and `getUnboundCopy`.
     * The returned instance must have match the most derived type of the `Bindable` class
     * this method is implemented on.
     */
    protected createInstance(): Bindable<T> {
        return new Bindable(this._value);
    }

    /**
     * Retrieves a new `Bindable` instance weakly bound to the configuration backing.
     * If you are further binding to events of a `Bindable` retrieved using this method, ensure to hold
     * a local reference.
     *
     * @returns A weakly bound copy of this `Bindable`.
     */
    getBoundCopy(): Bindable<T> {
        const copy: Bindable<T> = this.createInstance();
        copy.bindTo(this);
        return copy;
    }

    private leasedBindable: LeasedBindable<T> | null = null;

    private get isLeased(): boolean {
        return this.leasedBindable !== null;
    }

    /**
     * Takes out a mutually exclusive lease on this `Bindable`.
     *
     * During a lease, this `Bindable` will be set to `disabled`, but changes can still be applied via the `LeasedBindable`
     * returned by this call.
     *
     * You should end a lease by calling `LeasedBindable.return` when done.
     *
     * @param revertValueOnReturn Whether the `value` and `disabled` when `beginLease` was called should be restored when the lease ends.
     * @returns A `Bindable` with a lease.
     */
    beginLease(revertValueOnReturn: boolean): LeasedBindable<T> {
        if (this.checkForLease(this)) {
            throw new Error(
                "Attempted to lease a bindable that is already in a leased state."
            );
        }

        return (this.leasedBindable = new LeasedBindable(
            this,
            revertValueOnReturn
        ));
    }

    private checkForLease(source: Bindable<T>): boolean {
        if (this.isLeased) {
            return true;
        }

        if (!this.bindings) {
            return false;
        }

        let found: boolean = false;

        for (const b of this.bindings) {
            if (found) {
                break;
            }

            if (b !== source) {
                found = b?.checkForLease(this) ?? false;
            }
        }

        return found;
    }

    /**
     * Ends the lease on this `Bindable`.
     *
     * You should be using `LeasedBindable.return` instead to ensure that values are returned properly.
     *
     * @param returnedBindable The `LeasedBindable` that was provided as a return of a `beginLease` call.
     */
    endLease(returnedBindable: LeasedBindable<T>): void {
        if (!this.isLeased) {
            throw new Error("Attempted to end a lease without beginning one.");
        }

        if (returnedBindable !== this.leasedBindable) {
            throw new Error(
                "Attempted to end a lease, but returned a different bindable to the one used to start the lease."
            );
        }

        this.leasedBindable = null;
    }

    private throwIfLeased(): void {
        if (this.isLeased) {
            throw new Error(
                "Cannot perform this operation on a bindable that is currently in a leased state."
            );
        }
    }
}

//#endregion
//#region Leased bindable

/**
 * A `Bindable` carrying a mutually exclusive lease on another `Bindable`.
 * Can only be retrieved via `Bindable.beginLease()`.
 */
class LeasedBindable<T> extends Bindable<T> {
    private readonly source?: Bindable<T>;

    private readonly valueBeforeLease?: T;
    private readonly disabledBeforeLease: boolean = false;
    private readonly revertValueOnReturn: boolean = false;
    private hasBeenReturned: boolean = false;

    constructor(defaultValue: T);
    constructor(sourceVal: Bindable<T>, revertValueOnReturn?: boolean);
    constructor(sourceVal: Bindable<T> | T, revertValueOnReturn?: boolean) {
        super(sourceVal instanceof Bindable<T> ? sourceVal.value : sourceVal);

        if (!(sourceVal instanceof Bindable<T>)) {
            // Used for `getBoundCopy`, where we don't want a source.
            return;
        }

        this.source = sourceVal;
        this.bindTo(sourceVal);

        this.revertValueOnReturn = revertValueOnReturn ?? false;
        if (revertValueOnReturn) {
            this.valueBeforeLease = this.value;
        }

        this.disabledBeforeLease = this.disabled;
        this.disabled = true;
    }

    /**
     * Ends the lease on the source `Bindable`.
     *
     * @returns Whether the lease was returned by this call. Will be `false` if already returned.
     */
    return(): boolean {
        if (this.hasBeenReturned) {
            return false;
        }

        if (!this.source) {
            throw new Error("Must return from original leased source.");
        }

        this.unbindAll();
        return true;
    }

    override get value(): T {
        return super.value;
    }

    override set value(value: T) {
        if (this.source) {
            this.checkValid();
        }

        if (this.value === value) {
            return;
        }

        this.setValue(super.value, value, true);
    }

    override get defaultValue(): T {
        return super.defaultValue;
    }

    override set defaultValue(value: T) {
        if (this.defaultValue === value) {
            return;
        }

        this.setDefaultValue(super.defaultValue, value, true);
    }

    override get disabled(): boolean {
        return super.disabled;
    }

    override set disabled(value: boolean) {
        if (this.source) {
            this.checkValid();
        }

        if (this.disabled === value) {
            return;
        }

        this.setDisabled(value, true);
    }

    protected override unbindAllInternal(): void {
        if (this.source && !this.hasBeenReturned) {
            if (this.revertValueOnReturn) {
                this.value = <T>this.valueBeforeLease;
            }

            this.disabled = this.disabledBeforeLease;

            this.source.endLease(this);
            this.hasBeenReturned = true;
        }

        super.unbindAllInternal();
    }

    protected override createInstance(): LeasedBindable<T> {
        if (!this.source) {
            throw new Error(
                "Attempting to create a leased bindable instance without a bindable source."
            );
        }

        return new LeasedBindable(this.source.defaultValue);
    }

    private checkValid(): void {
        if (this.source && this.hasBeenReturned) {
            throw new Error(
                "Cannot perform operations on a leased bindable that has been returned."
            );
        }
    }
}

export type { LeasedBindable };
//#endregion
