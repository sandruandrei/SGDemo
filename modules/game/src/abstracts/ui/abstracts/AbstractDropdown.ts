import {Container, FederatedPointerEvent, Graphics, Rectangle, Text} from "pixi.js";
import {AbstractBitmapText} from "../../graphics/AbstractBitmapText.ts";

interface DropdownProps {
    width?: number;
    height?: number;
    bgColor?: number;
    options: (string | number)[];
    maxVisibleItems?: number;
    fontSize?: number;
    cornerRadius?: number;
    onChange?: (value: string | number) => void;
    openOnTop?: boolean;
    prefix?: string;
}

export class AbstractDropdown extends Container {
    protected background!: Graphics;
    protected selectedText!: Text | AbstractBitmapText;
    protected dropdownList!: Container;
    protected isOpen: boolean = false;
    protected readonly props: Required<DropdownProps>;
    protected scrollOffset: number = 0;
    protected itemHeight: number = 40;
    protected readonly scrollbarWidth: number = 8;
    protected _value: string | number = ``;
    protected isExternalUpdate: boolean = false;
    protected _currency: string = ``;

    public set currency(currency: string) {
        if (this._currency === currency) return;
        this._currency = currency;
        this.selectedText.text = `${this.props.prefix} ${this._value} ${this._currency}`;
    }

    get value(): string | number {
        return this._value;
    }

    set value(value: string | number) {
        const textValue = typeof value === `number` ? value.toFixed(2) : value;

        if (this.props.options.includes(textValue)) {
            this.isExternalUpdate = true;
            this._value = value;
            this.selectedText.text = `${this.props.prefix} ${textValue} ${this._currency}`;
            this.selectedText.resolution = window.devicePixelRatio || 1;
            this.isExternalUpdate = false;
        }
    }

    constructor(props: DropdownProps) {
        super();
        this.name = `dropdown`;
        this.props = {
            width: 200,
            height: 40,
            bgColor: 0x2ecc71,
            maxVisibleItems: 10,
            fontSize: 16,
            cornerRadius: 8,
            onChange: () => {},
            openOnTop: false,
            prefix: ``,
            ...props
        };

        this.setup();
    }

    protected setup(): void {
        this.dropdownList = new Container();
        this.dropdownList.name = `dropdown-list`;
        this.dropdownList.visible = false;
        this.dropdownList.position.set(0, this.props.height);
        this.addChild(this.dropdownList);

        // Create selected text
        this.selectedText = new Text(this.props.options[0] || ``, {
            fontFamily: `Arial`,
            fontSize: this.props.fontSize,
            fill: 0xffffff,
            align: `center`
        });

        this.selectedText.name = `dropdown-selected-text`;
        this.selectedText.anchor.set(0.5);
        this.selectedText.position.set(this.props.width / 2, this.props.height / 2);
        this.selectedText.interactive = false;
        this.selectedText.interactiveChildren = false;
        this.addChild(this.selectedText);

        const arrow = new Graphics();
        arrow.name = `dropdown-arrow`;
        arrow.beginFill(0xffffff);
        arrow.moveTo(-5, -3);
        arrow.lineTo(5, -3);
        arrow.lineTo(0, 3);
        arrow.endFill();
        arrow.position.set(this.props.width - 20, this.props.height / 2);
        arrow.cursor = `pointer`;
        arrow.interactive = false;
        arrow.interactiveChildren = false;
        this.addChild(arrow);

        this.background = new Graphics();
        this.background.name = `dropdown-background`;
        this.drawBackground();
        this.addChildAt(this.background, 0); // Add at index 0 to be behind other elements

        this.eventMode = `static`;
        this.cursor = `pointer`;
        this.on(`pointerdown`, this.toggleDropdown);
    }

    protected drawBackground(): void {
        this.background.clear();
        this.background.beginFill(this.props.bgColor);
        this.background.drawRoundedRect(
            0,
            0,
            this.props.width,
            this.props.height,
            this.props.cornerRadius
        );
        this.background.endFill();
    }

    private toggleDropdown = (): void => {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.openDropdown();
        } else {
            this.closeDropdown();
        }
    };

    protected openDropdown(): void {
        this.dropdownList.removeChildren();
        this.dropdownList.visible = true;

        const visibleItems = Math.min(this.props.maxVisibleItems, this.props.options.length);
        const listHeight = visibleItems * this.itemHeight;

        this.dropdownList.position.set(0, this.props.openOnTop ? -listHeight : this.props.height);

        const listBg = new Graphics();
        listBg.name = `dropdown-list-bg`;
        listBg.beginFill(this.props.bgColor, 0.95);
        listBg.drawRoundedRect(0, 0, this.props.width, listHeight, this.props.cornerRadius);
        listBg.endFill();
        this.dropdownList.addChild(listBg);

        const mask = new Graphics();
        mask.name = `dropdown-mask`;
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, this.props.width - this.scrollbarWidth, listHeight);
        mask.endFill();
        this.dropdownList.addChild(mask);

        const optionsContainer = new Container();
        optionsContainer.name = `dropdown-options-container`;
        optionsContainer.mask = mask;
        this.dropdownList.addChild(optionsContainer);

        this.props.options.forEach((option, index) => {
            const item = this.createDropdownItem(option, index);
            optionsContainer.addChild(item);
        });

        if (this.props.options.length > this.props.maxVisibleItems) {
            this.createScrollbar(listHeight, optionsContainer);
        }

        this.dropdownList.eventMode = `static`;
        this.dropdownList.interactive = true;

        let scrollTimeout: number | null = null;

        const handleWheel = (event: WheelEvent) => {
            if (this.props.options.length <= this.props.maxVisibleItems) return;

            event.preventDefault();
            event.stopPropagation();

            const totalContentHeight = this.props.options.length * this.itemHeight;
            const listHeight = visibleItems * this.itemHeight;
            const maxScroll = totalContentHeight - listHeight;

            const scrollDelta = event.deltaY;

            let newScrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + scrollDelta));

            this.scrollOffset = newScrollOffset;
            optionsContainer.position.y = -this.scrollOffset;

            const scrollbar = this.dropdownList.getChildByName(`dropdown-scrollbar`);
            if (scrollbar) {
                const scrollbarHeight = (listHeight / totalContentHeight) * listHeight;
                const newScrollbarY =
                    (this.scrollOffset / maxScroll) * (listHeight - scrollbarHeight);
                scrollbar.position.y = newScrollbarY;
            }

            if (scrollTimeout !== null) {
                window.clearTimeout(scrollTimeout);
            }

            scrollTimeout = window.setTimeout(() => {
                const itemsScrolled = Math.round(this.scrollOffset / this.itemHeight);
                newScrollOffset = Math.max(0, Math.min(maxScroll, itemsScrolled * this.itemHeight));

                this.scrollOffset = newScrollOffset;
                optionsContainer.position.y = -this.scrollOffset;

                if (scrollbar) {
                    const scrollbarHeight = (listHeight / totalContentHeight) * listHeight;
                    const newScrollbarY =
                        (this.scrollOffset / maxScroll) * (listHeight - scrollbarHeight);
                    scrollbar.position.y = newScrollbarY;
                }
            }, 150);
        };

        this.dropdownList.removeEventListener(`wheel`, handleWheel as any);
        this.dropdownList.addEventListener(`wheel`, handleWheel as any);

        window.addEventListener(`pointerdown`, this.handleClickOutside);
    }

    protected createDropdownItem(option: string | number, index: number): Container {
        const item = new Container();
        item.name = `dropdown-item-${index}`;
        item.position.set(0, index * this.itemHeight);

        const itemBg = new Graphics();
        itemBg.name = `dropdown-item-bg-${index}`;
        itemBg.beginFill(0x000000, 0);
        itemBg.drawRect(0, 0, this.props.width - this.scrollbarWidth, this.itemHeight);
        itemBg.endFill();
        item.addChild(itemBg);

        const text = new Text(option, {
            fontFamily: `Arial`,
            fontSize: this.props.fontSize,
            fill: 0xffffff,
            align: `center`
        });
        text.resolution = window.devicePixelRatio || 1;
        text.name = `dropdown-item-text-${index}`;
        text.anchor.set(0.5);
        text.position.set((this.props.width - this.scrollbarWidth) / 2, this.itemHeight / 2);
        item.addChild(text);

        item.interactive = true;
        item.interactiveChildren = true;
        item.cursor = `pointer`;

        item.hitArea = new Rectangle(0, 0, this.props.width, 100);

        item.on(`pointerover`, () => {
            itemBg.clear();
            itemBg.beginFill(0xffffff, 0.2);
            itemBg.drawRect(0, 0, this.props.width - this.scrollbarWidth, this.itemHeight);
            itemBg.endFill();
        });

        item.on(`pointerout`, () => {
            itemBg.clear();
            itemBg.beginFill(0x000000, 0);
            itemBg.drawRect(0, 0, this.props.width - this.scrollbarWidth, this.itemHeight);
            itemBg.endFill();
        });

        item.on(`pointerdown`, (event: FederatedPointerEvent) => {
            event.stopPropagation();
            this.selectOption(option);
        });

        return item;
    }

    protected createScrollbar(listHeight: number, optionsContainer: Container): void {
        const totalContentHeight = this.props.options.length * this.itemHeight;
        const scrollbarHeight = (listHeight / totalContentHeight) * listHeight;

        const scrollbarBg = new Graphics();
        scrollbarBg.name = `dropdown-scrollbar-bg`;
        scrollbarBg.beginFill(0x000000, 0.2);
        scrollbarBg.drawRoundedRect(
            this.props.width - this.scrollbarWidth,
            0,
            this.scrollbarWidth,
            listHeight,
            4
        );
        scrollbarBg.endFill();
        this.dropdownList.addChild(scrollbarBg);

        const scrollbar = new Graphics();
        scrollbar.name = `dropdown-scrollbar`;
        scrollbar.beginFill(0xffffff, 0.5);
        scrollbar.drawRoundedRect(
            this.props.width - this.scrollbarWidth,
            0,
            this.scrollbarWidth,
            scrollbarHeight,
            4
        );
        scrollbar.endFill();
        scrollbar.eventMode = `static`;
        scrollbar.cursor = `pointer`;
        this.dropdownList.addChild(scrollbar);

        let isDragging = false;
        let startY = 0;
        let startScrollOffset = 0;

        scrollbar.on(`pointerdown`, (event: FederatedPointerEvent) => {
            event.stopPropagation();
            isDragging = true;
            startY = event.globalY;
            startScrollOffset = this.scrollOffset;
        });

        window.addEventListener(`pointermove`, (event: PointerEvent) => {
            if (!isDragging) return;

            const delta = event.clientY - startY;
            const maxScroll = totalContentHeight - listHeight;
            const scrollRatio = delta / (listHeight - scrollbarHeight);
            this.scrollOffset = Math.max(
                0,
                Math.min(maxScroll, startScrollOffset + scrollRatio * maxScroll)
            );

            optionsContainer.position.y = -this.scrollOffset;
            scrollbar.position.y = (this.scrollOffset / maxScroll) * (listHeight - scrollbarHeight);
        });

        window.addEventListener(`pointerup`, () => {
            isDragging = false;
        });
    }

    protected selectOption(option: string | number): void {
        this._value = option;
        this.selectedText.text = `${this.props.prefix} ${option} ${this._currency}`;
        this.selectedText.resolution = window.devicePixelRatio || 1;
        if (!this.isExternalUpdate) {
            this.props.onChange(option);
        }
        this.closeDropdown();
    }

    protected closeDropdown(): void {
        this.isOpen = false;
        this.dropdownList.visible = false;
        window.removeEventListener(`pointerdown`, this.handleClickOutside);
    }

    protected handleClickOutside = (event: PointerEvent): void => {
        const bounds = this.getBounds();
        const isClickInside =
            event.clientX >= bounds.x &&
            event.clientX <= bounds.x + bounds.width &&
            event.clientY >= bounds.y &&
            event.clientY <= bounds.y + bounds.height + this.dropdownList.height;

        if (!isClickInside) {
            this.closeDropdown();
        }
    };
}
