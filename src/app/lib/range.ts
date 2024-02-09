export class Range {
    target: HTMLElement;
    seek_lock: boolean;
    value: number;
    min_value: number;
    max_value: number;
    type: string;
    path: HTMLDivElement;
    fill: HTMLElement;
    percentage: number = 0;
    valueChanged: CallableFunction|null;
    percentageChanged: CallableFunction|null;

    constructor(
        target: HTMLDivElement,
        valueChanged: CallableFunction|null,
        percentageChanged: CallableFunction|null,
        min_value: number,
        max_value:number,
        value: number,
        type: string,
        classlist: string
    ) {
        if(min_value > max_value) {
            throw "max_value must be larger than min_value";
        }

        if(value > max_value || value < min_value) {
            throw "Default value out of range";
        }

        this.target = target;
        this.valueChanged = valueChanged;
        this.percentageChanged = percentageChanged;
        this.seek_lock = false;
        this.value = value;
        this.min_value = min_value;
        this.max_value = max_value;
        this.type = type;

        this.path = document.createElement('div');
        this.path.style.border = '1px solid white';
        this.path.style.cursor = 'pointer';
        this.fill = document.createElement('div');
    
        if(this.type == 'horizontal') {
            this.path.style.height = '15px';
            this.path.style.width = '100%';
            this.fill.style.height = '100%';
            this.fill.style.width = '0';
            // this.fill.style.float = 'left';
            // this.fill.style.borderRadius = '0 100%';
            this.fill.style.backgroundColor = '#c54310';
        }
    
        if(this.type == 'vertical') {
            this.path.style.width = '4px';
            this.path.style.height = '100%';
            this.path.style.backgroundColor = 'white';
            this.fill.style.width = '2px';
            this.fill.style.height = '100%';
            // this.fill.style.borderRadius = '100% 100% 0 0';
            this.fill.style.backgroundColor = 'black';
        }
    
        this.path.appendChild(this.fill);
        this.target.appendChild(this.path);
        this.target.className = classlist;

        this.target.addEventListener('mousedown', (e: MouseEvent) => {
            this.seek_lock = true;
            var rect = this.target.getBoundingClientRect();
            window.addEventListener('mousemove', this.updateProgressPosition, false);
            window.addEventListener('mouseup', this.seekMouseUp, false);
    
            if(this.type == 'horizontal') {
                this.setPercentage((e.clientX - rect.left) / rect.width);
            }
    
            if(this.type == 'vertical') {
                this.setPercentage((e.clientY - rect.top) / rect.height);
            }
    
        }, false);

        this.setValue(value);
    }

    setMaxValue(value: number) {
        this.max_value = value;
    }

    getValue() {
        return this.value;
    }

    getPercentage() {
        return this.percentage;
    }

    setValue(value: number, triggerCallback: boolean = false) {
        if(this.seek_lock) {
            return;
        }

        if(this.type == 'vertical') {
            value = this.max_value - value;
        }

        if(value >= this.max_value) {
            value = this.max_value;
        }

        if(value <= this.min_value) {
            value = this.min_value;
        }
        
        this.value = value;
        this.percentage = (value - this.min_value) / (this.max_value - this.min_value);

        this.represent();

        if(this.valueChanged && triggerCallback) {
            this.valueChanged(this.value);
        }
    }

    setPercentage(percentage: number, triggerCallback: boolean = false) {
        if(percentage < 0) {
            percentage = 0;
        }

        if(percentage > 1) {
            percentage = 1;
        }

        this.value = percentage * (this.max_value - this.min_value)
        this.percentage = percentage;

        this.represent();

        if(this.percentageChanged && triggerCallback) {
            this.percentageChanged(this.percentage);
        }
    }

    represent() {
        if(this.type == 'vertical') {
            this.fill.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.fill.style.width = (this.percentage * 100) + '%';
        }
    }

    private seekMouseUp = (e: MouseEvent) => {
        window.removeEventListener('mouseup', this.seekMouseUp);
    
        if(!this.seek_lock) {
            return;
        }
       
        this.seek_lock = false;

        window.removeEventListener('mousemove', this.updateProgressPosition);

        if(this.valueChanged != undefined) {
            if(this.type == 'horizontal') {
                this.valueChanged(this.value);
            }

            if(this.type == 'vertical') {
                this.valueChanged(this.max_value - this.value);
            }
        }
    }
    
    private updateProgressPosition = (e: MouseEvent) => {
        var rect = this.target.getBoundingClientRect();

        if(this.type == 'horizontal') {
            this.setPercentage((e.clientX - rect.left) / rect.width);
        }

        if(this.type == 'vertical') {
            this.setPercentage((e.clientY - rect.top) / rect.height);
        }
    }
    

}