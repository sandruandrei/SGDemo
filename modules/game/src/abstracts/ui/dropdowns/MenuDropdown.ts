import {gsap} from "gsap";
import {Container, FederatedPointerEvent, Graphics, Rectangle} from "pixi.js";
import {gameConfig} from "../../config.ts";
import {AbstractBitmapText} from "../../graphics/AbstractBitmapText.ts";
import {signalsManager} from "../../signals/SignalsManager.ts";
import {FontsNames, SignalNames} from "../../types/enums.ts";
import {AbstractDropdown} from "../abstracts/AbstractDropdown.ts";

export class MenuDropdown extends AbstractDropdown {
    constructor() {
        const gamesOptions = gameConfig.gamesNames.map((name) => name);

        super({
            options: gamesOptions,
            bgColor: 0x000000,
            width: 320,
            height: 54,
            onChange: (value: string | number) => {
                console.log(`Selected bet: ${value}`);
                signalsManager.emit(SignalNames.CHANGE_GAME, value);
            },
            openOnTop: false,
            fontSize: 20
        });

        this.name = `betDropdown`;
        this.value = 0;

        this.itemHeight = 54;
    }

    protected override setup() {
        super.setup();

        this.selectedText.destroy();

        this.selectedText = new AbstractBitmapText({
            text: this.props.options[0].toString() || ``,
            style: {
                fontName: FontsNames.MENU_FONT,
                fontSize: 23
            }
        });

        this.selectedText.name = `dropdown-selected-text`;
        this.selectedText.eventMode = "none";
        this.selectedText.interactiveChildren = false;
        this.addChild(this.selectedText);

        this.selectedText.x = this.props.width / 2;
        this.selectedText.y = this.props.height / 4 + 2;
    }

    set value(value: string | number) {
        const textValue = typeof value === `number` ? value.toFixed(2) : value;

        if (this.props.options.includes(textValue)) {
            this.isExternalUpdate = true;
            this._value = value;
            (this.selectedText as AbstractBitmapText).updateValue(
                `${this.props.prefix} ${textValue} ${this._currency}`
            );
            this.selectedText.resolution = window.devicePixelRatio || 1;
            this.isExternalUpdate = false;
        }
    }

    protected override selectOption(option: string | number): void {
        this._value = option;
        (this.selectedText as AbstractBitmapText).updateValue(
            `${this.props.prefix} ${option} ${this._currency}`
        );
        this.selectedText.resolution = window.devicePixelRatio || 1;
        if (!this.isExternalUpdate) {
            this.props.onChange(option);
        }
        this.closeDropdown();
    }

    protected override drawBackground(): void {
        this.background.clear();
        this.background.lineStyle(3, 0xffffff, 0.1);
        this.background.beginFill(this.props.bgColor, 0.1);
        this.background.drawRoundedRect(
            0,
            0,
            this.props.width,
            this.props.height,
            this.props.cornerRadius
        );
        this.background.endFill();
    }

    protected override createDropdownItem(option: string | number, index: number): Container {
        const item = new Container();
        item.name = `dropdown-item-${index}`;
        item.position.set(0, index * this.itemHeight);

        const itemBg = new Graphics();
        itemBg.name = `dropdown-item-bg-${index}`;
        itemBg.beginFill(0x031063f);
        itemBg.lineStyle(3, 0xffffff);
        itemBg.drawRoundedRect(0, 0, this.props.width, this.itemHeight, 8);
        itemBg.endFill();

        item.addChild(itemBg);

        const text = new AbstractBitmapText({
            text: option.toString() || ``,
            style: {
                fontName: FontsNames.MENU_FONT,
                fontSize: 23
            }
        });
        text.resolution = window.devicePixelRatio || 1;
        text.name = `dropdown-item-text-${index}`;

        text.position.set(this.props.width / 2, this.itemHeight / 4);
        item.addChild(text);

        item.interactive = true;
        item.interactiveChildren = true;
        item.cursor = `pointer`;

        item.hitArea = new Rectangle(0, 0, this.props.width, 100);

        item.on(`pointerover`, () => {
            gsap.set(itemBg, {
                pixi: {
                    colorize: "#562669",
                    colorizeAmount: 0.5
                }
            });
        });

        item.on(`pointerout`, () => {
            // @ts-ignore
            itemBg.filters = null;
        });

        item.on(`pointerdown`, (event: FederatedPointerEvent) => {
            event.stopPropagation();
            this.selectOption(option);
        });

        return item;
    }

    protected override openDropdown(): void {
        this.dropdownList.removeChildren();
        this.dropdownList.visible = true;

        const visibleItems = Math.min(this.props.maxVisibleItems, this.props.options.length);
        const listHeight = visibleItems * this.itemHeight;

        this.dropdownList.position.set(0, this.props.openOnTop ? -listHeight : this.props.height);

        const mask = new Graphics();
        mask.name = `dropdown-mask`;
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, this.props.width, listHeight);
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
}
