import { EncodeOptions } from '../shared/meta';
import type WorkerBridge from 'client/lazy-app/worker-bridge';
import { h, Component } from 'preact';
import {
  inputFieldCheckedAsNumber,
  inputFieldValueAsNumber,
  preventDefault,
} from 'client/lazy-app/util';
import * as style from 'client/lazy-app/Compress/Options/style.css';
import linkState from 'linkstate';
import Range from 'client/lazy-app/Compress/Options/Range';
import Checkbox from 'client/lazy-app/Compress/Options/Checkbox';
import Expander from 'client/lazy-app/Compress/Options/Expander';
import Select from 'client/lazy-app/Compress/Options/Select';
import Revealer from 'client/lazy-app/Compress/Options/Revealer';

export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions,
) => workerBridge.webpEncode(signal, imageData, options);

const enum WebPImageHint {
  WEBP_HINT_DEFAULT, // default preset.
  WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
  WEBP_HINT_PHOTO, // outdoor photograph, with natural lighting
  WEBP_HINT_GRAPH, // Discrete tone image (graph, map-tile etc).
}

interface Props {
  options: EncodeOptions;
  onChange(newOptions: EncodeOptions): void;
}

interface State {
  showAdvanced: boolean;
}

// From kLosslessPresets in config_enc.c
// The format is [method, quality].
const losslessPresets: [number, number][] = [
  [0, 0],
  [1, 20],
  [2, 25],
  [3, 30],
  [3, 50],
  [4, 50],
  [4, 75],
  [4, 90],
  [5, 90],
  [6, 100],
];
const losslessPresetDefault = 6;

function determineLosslessQuality(quality: number, method: number): number {
  const index = losslessPresets.findIndex(
    ([presetMethod, presetQuality]) =>
      presetMethod === method && presetQuality === quality,
  );
  if (index !== -1) return index;
  // Quality doesn't match one of the presets.
  // This can happen when toggling 'lossless'.
  return losslessPresetDefault;
}

export class Options extends Component<Props, State> {
  state: State = {
    showAdvanced: false,
  };

  onChange = (event: Event) => {
    const form = (event.currentTarget as HTMLInputElement).closest(
      'form',
    ) as HTMLFormElement;
    const lossless = inputFieldCheckedAsNumber(form.lossless);
    const { options } = this.props;
    const losslessPresetValue = inputFieldValueAsNumber(
      form.lossless_preset,
      determineLosslessQuality(options.quality, options.method),
    );

    const newOptions: EncodeOptions = {
      // Copy over options the form doesn't care about, eg emulate_jpeg_size
      ...options,
      // And now stuff from the form:
      lossless,
      // Special-cased inputs:
      // In lossless mode, the quality is derived from the preset.
      quality: lossless
        ? losslessPresets[losslessPresetValue][1]
        : inputFieldValueAsNumber(form.quality, options.quality),
      // In lossless mode, the method is derived from the preset.
      method: lossless
        ? losslessPresets[losslessPresetValue][0]
        : inputFieldValueAsNumber(form.method_input, options.method),
      image_hint: inputFieldCheckedAsNumber(form.image_hint, options.image_hint)
        ? WebPImageHint.WEBP_HINT_GRAPH
        : WebPImageHint.WEBP_HINT_DEFAULT,
      // .checked
      exact: inputFieldCheckedAsNumber(form.exact, options.exact),
      alpha_compression: inputFieldCheckedAsNumber(
        form.alpha_compression,
        options.alpha_compression,
      ),
      autofilter: inputFieldCheckedAsNumber(
        form.autofilter,
        options.autofilter,
      ),
      filter_type: inputFieldCheckedAsNumber(
        form.filter_type,
        options.filter_type,
      ),
      use_sharp_yuv: inputFieldCheckedAsNumber(
        form.use_sharp_yuv,
        options.use_sharp_yuv,
      ),
      // .value
      near_lossless:
        100 -
        inputFieldValueAsNumber(
          form.near_lossless,
          100 - options.near_lossless,
        ),
      alpha_quality: inputFieldValueAsNumber(
        form.alpha_quality,
        options.alpha_quality,
      ),
      alpha_filtering: inputFieldValueAsNumber(
        form.alpha_filtering,
        options.alpha_filtering,
      ),
      sns_strength: inputFieldValueAsNumber(
        form.sns_strength,
        options.sns_strength,
      ),
      filter_strength: inputFieldValueAsNumber(
        form.filter_strength,
        options.filter_strength,
      ),
      filter_sharpness:
        7 -
        inputFieldValueAsNumber(
          form.filter_sharpness,
          7 - options.filter_sharpness,
        ),
      pass: inputFieldValueAsNumber(form.pass, options.pass),
      preprocessing: inputFieldValueAsNumber(
        form.preprocessing,
        options.preprocessing,
      ),
      segments: inputFieldValueAsNumber(form.segments, options.segments),
      partitions: inputFieldValueAsNumber(form.partitions, options.partitions),
    };
    this.props.onChange(newOptions);
  };

  private _losslessSpecificOptions(options: EncodeOptions) {
    return (
      <div key="lossless">
        <div class={style.optionOneCell}>
          <Range
            name="lossless_preset"
            min="0"
            max="9"
            value={determineLosslessQuality(options.quality, options.method)}
            onInput={this.onChange}
          >
            压缩强度:
          </Range>
        </div>
        <div class={style.optionOneCell}>
          <Range
            name="near_lossless"
            min="0"
            max="100"
            value={'' + (100 - options.near_lossless)}
            onInput={this.onChange}
          >
            轻微损失:
          </Range>
        </div>
        <label class={style.optionToggle}>
          离散色调图像
          {/*
            Although there are 3 different kinds of image hint, webp only
            seems to do something with the 'graph' type, and I don't really
            understand what it does.
          */}
          <Checkbox
            name="image_hint"
            checked={options.image_hint === WebPImageHint.WEBP_HINT_GRAPH}
            onChange={this.onChange}
          />
        </label>
      </div>
    );
  }

  private _lossySpecificOptions(options: EncodeOptions) {
    const { showAdvanced } = this.state;

    return (
      <div key="lossy">
        <div class={style.optionOneCell}>
          <Range
            name="method_input"
            min="0"
            max="6"
            value={options.method}
            onInput={this.onChange}
          >
            压缩强度:
          </Range>
        </div>
        <div class={style.optionOneCell}>
          <Range
            name="quality"
            min="0"
            max="100"
            step="0.1"
            value={options.quality}
            onInput={this.onChange}
          >
            质量:
          </Range>
        </div>
        <label class={style.optionReveal}>
          <Revealer
            checked={showAdvanced}
            onChange={linkState(this, 'showAdvanced')}
          />
          高级设置
        </label>
        <Expander>
          {showAdvanced ? (
            <div>
              <label class={style.optionToggle}>
                透明度压缩
                <Checkbox
                  name="alpha_compression"
                  checked={!!options.alpha_compression}
                  onChange={this.onChange}
                />
              </label>
              <div class={style.optionOneCell}>
                <Range
                  name="alpha_quality"
                  min="0"
                  max="100"
                  value={options.alpha_quality}
                  onInput={this.onChange}
                >
                  透明度质量:
                </Range>
              </div>
              <div class={style.optionOneCell}>
                <Range
                  name="alpha_filtering"
                  min="0"
                  max="2"
                  value={options.alpha_filtering}
                  onInput={this.onChange}
                >
                  透明度滤镜质量:
                </Range>
              </div>
              <label class={style.optionToggle}>
                自动调整滤镜强度
                <Checkbox
                  name="autofilter"
                  checked={!!options.autofilter}
                  onChange={this.onChange}
                />
              </label>
              <Expander>
                {options.autofilter ? null : (
                  <div class={style.optionOneCell}>
                    <Range
                      name="filter_strength"
                      min="0"
                      max="100"
                      value={options.filter_strength}
                      onInput={this.onChange}
                    >
                      滤镜强度:
                    </Range>
                  </div>
                )}
              </Expander>
              <label class={style.optionToggle}>
                强滤镜
                <Checkbox
                  name="filter_type"
                  checked={!!options.filter_type}
                  onChange={this.onChange}
                />
              </label>
              <div class={style.optionOneCell}>
                <Range
                  name="filter_sharpness"
                  min="0"
                  max="7"
                  value={7 - options.filter_sharpness}
                  onInput={this.onChange}
                >
                  滤镜锐度:
                </Range>
              </div>
              <label class={style.optionToggle}>
                精准的 RGB 到 YUV 转换
                <Checkbox
                  name="use_sharp_yuv"
                  checked={!!options.use_sharp_yuv}
                  onChange={this.onChange}
                />
              </label>
              <div class={style.optionOneCell}>
                <Range
                  name="pass"
                  min="1"
                  max="10"
                  value={options.pass}
                  onInput={this.onChange}
                >
                  次数:
                </Range>
              </div>
              <div class={style.optionOneCell}>
                <Range
                  name="sns_strength"
                  min="0"
                  max="100"
                  value={options.sns_strength}
                  onInput={this.onChange}
                >
                  空间噪声整形:
                </Range>
              </div>
              <label class={style.optionTextFirst}>
                预处理:
                <Select
                  name="preprocessing"
                  value={options.preprocessing}
                  onChange={this.onChange}
                >
                  <option value="0">无</option>
                  <option value="1">分段平滑</option>
                  <option value="2">伪随机抖动</option>
                </Select>
              </label>
              <div class={style.optionOneCell}>
                <Range
                  name="segments"
                  min="1"
                  max="4"
                  value={options.segments}
                  onInput={this.onChange}
                >
                  分段:
                </Range>
              </div>
              <div class={style.optionOneCell}>
                <Range
                  name="partitions"
                  min="0"
                  max="3"
                  value={options.partitions}
                  onInput={this.onChange}
                >
                  分区:
                </Range>
              </div>
            </div>
          ) : null}
        </Expander>
      </div>
    );
  }

  render({ options }: Props) {
    // I'm rendering both lossy and lossless forms, as it becomes much easier when
    // gathering the data.
    return (
      <form class={style.optionsSection} onSubmit={preventDefault}>
        <label class={style.optionToggle}>
          无损
          <Checkbox
            name="lossless"
            checked={!!options.lossless}
            onChange={this.onChange}
          />
        </label>
        {options.lossless
          ? this._losslessSpecificOptions(options)
          : this._lossySpecificOptions(options)}
        <label class={style.optionToggle}>
          保留透明数据
          <Checkbox
            name="exact"
            checked={!!options.exact}
            onChange={this.onChange}
          />
        </label>
      </form>
    );
  }
}
