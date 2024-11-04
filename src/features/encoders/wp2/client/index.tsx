import { EncodeOptions, UVMode, Csp } from '../shared/meta';
import { defaultOptions } from '../shared/meta';
import type WorkerBridge from 'client/lazy-app/worker-bridge';
import { h, Component } from 'preact';
import { preventDefault, shallowEqual } from 'client/lazy-app/util';
import * as style from 'client/lazy-app/Compress/Options/style.css';
import Range from 'client/lazy-app/Compress/Options/Range';
import Select from 'client/lazy-app/Compress/Options/Select';
import Checkbox from 'client/lazy-app/Compress/Options/Checkbox';
import Expander from 'client/lazy-app/Compress/Options/Expander';
import linkState from 'linkstate';
import Revealer from 'client/lazy-app/Compress/Options/Revealer';

// 编码函数
export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions,
) => workerBridge.wp2Encode(signal, imageData, options);

interface Props {
  options: EncodeOptions; // 选项
  onChange(newOptions: EncodeOptions): void; // 当选项变化时的回调
}

interface State {
  options: EncodeOptions; // 选项
  effort: number; // 努力程度
  quality: number; // 质量
  alphaQuality: number; // alpha 质量
  passes: number; // 传递次数
  sns: number; // 空间噪声塑形
  uvMode: number; // UV 模式
  lossless: boolean; // 是否无损
  slightLoss: number; // 轻微损失
  colorSpace: number; // 色彩空间
  errorDiffusion: number; // 错误扩散
  useRandomMatrix: boolean; // 是否使用随机矩阵
  showAdvanced: boolean; // 是否显示高级设置
  separateAlpha: boolean; // 是否分离 alpha
}

export class Options extends Component<Props, State> {
  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    if (state.options && shallowEqual(state.options, props.options)) {
      return null;
    }

    const { options } = props;

    const modifyState: Partial<State> = {
      options,
      effort: options.effort,
      alphaQuality: options.alpha_quality,
      passes: options.pass,
      sns: options.sns,
      uvMode: options.uv_mode,
      colorSpace: options.csp_type,
      errorDiffusion: options.error_diffusion,
      useRandomMatrix: options.use_random_matrix,
      separateAlpha: options.quality !== options.alpha_quality,
    };

    // 如果质量 > 95，则为无损且轻微损失
    if (options.quality > 95) {
      modifyState.lossless = true;
      modifyState.slightLoss = 100 - options.quality;
    } else {
      modifyState.quality = options.quality;
      modifyState.lossless = false;
    }

    return modifyState;
  }

  // 其他状态在 getDerivedStateFromProps 中设置
  state: State = {
    lossless: false,
    slightLoss: 0,
    quality: defaultOptions.quality,
    showAdvanced: false,
  } as State;

  private _inputChangeCallbacks = new Map<string, (event: Event) => void>();

  private _inputChange = (prop: keyof State, type: 'number' | 'boolean') => {
    // 缓存回调以提高性能
    if (!this._inputChangeCallbacks.has(prop)) {
      this._inputChangeCallbacks.set(prop, (event: Event) => {
        const formEl = event.target as HTMLInputElement | HTMLSelectElement;
        const newVal =
          type === 'boolean'
            ? 'checked' in formEl
              ? formEl.checked
              : !!formEl.value
            : Number(formEl.value);

        const newState: Partial<State> = {
          [prop]: newVal,
        };

        const optionState = {
          ...this.state,
          ...newState,
        };

        const newOptions: EncodeOptions = {
          effort: optionState.effort,
          quality: optionState.lossless
            ? 100 - optionState.slightLoss
            : optionState.quality,
          alpha_quality: optionState.separateAlpha
            ? optionState.alphaQuality
            : optionState.quality,
          pass: optionState.passes,
          sns: optionState.sns,
          uv_mode: optionState.uvMode,
          csp_type: optionState.colorSpace,
          error_diffusion: optionState.errorDiffusion,
          use_random_matrix: optionState.useRandomMatrix,
        };

        // 更新选项，因此我们不需要在 getDerivedStateFromProps 中重新计算。
        newState.options = newOptions;

        this.setState(newState);

        this.props.onChange(newOptions);
      });
    }

    return this._inputChangeCallbacks.get(prop)!;
  };

  render(
    {}: Props,
    {
      effort,
      alphaQuality,
      passes,
      quality,
      sns,
      uvMode,
      lossless,
      slightLoss,
      colorSpace,
      errorDiffusion,
      useRandomMatrix,
      separateAlpha,
      showAdvanced,
    }: State,
  ) {
    return (
      <form class={style.optionsSection} onSubmit={preventDefault}>
        <label class={style.optionToggle}>
          无损
          <Checkbox
            checked={lossless}
            onChange={this._inputChange('lossless', 'boolean')}
          />
        </label>
        <Expander>
          {lossless && (
            <div class={style.optionOneCell}>
              <Range
                min="0"
                max="5"
                step="0.1"
                value={slightLoss}
                onInput={this._inputChange('slightLoss', 'number')}
              >
                轻微损失:
              </Range>
            </div>
          )}
        </Expander>
        <Expander>
          {!lossless && (
            <div>
              <div class={style.optionOneCell}>
                <Range
                  min="0"
                  max="95"
                  step="0.1"
                  value={quality}
                  onInput={this._inputChange('quality', 'number')}
                >
                  质量:
                </Range>
              </div>
              <label class={style.optionToggle}>
                分离透明度质量
                <Checkbox
                  checked={separateAlpha}
                  onChange={this._inputChange('separateAlpha', 'boolean')}
                />
              </label>
              <Expander>
                {separateAlpha && (
                  <div class={style.optionOneCell}>
                    <Range
                      min="0"
                      max="100"
                      step="1"
                      value={alphaQuality}
                      onInput={this._inputChange('alphaQuality', 'number')}
                    >
                      透明度质量:
                    </Range>
                  </div>
                )}
              </Expander>
              <label class={style.optionReveal}>
                <Revealer
                  checked={showAdvanced}
                  onChange={linkState(this, 'showAdvanced')}
                />
                高级设置
              </label>
              <Expander>
                {showAdvanced && (
                  <div>
                    <div class={style.optionOneCell}>
                      <Range
                        min="1"
                        max="10"
                        step="1"
                        value={passes}
                        onInput={this._inputChange('passes', 'number')}
                      >
                        次数:
                      </Range>
                    </div>
                    <div class={style.optionOneCell}>
                      <Range
                        min="0"
                        max="100"
                        step="1"
                        value={sns}
                        onInput={this._inputChange('sns', 'number')}
                      >
                        空间噪声塑形:
                      </Range>
                    </div>
                    <div class={style.optionOneCell}>
                      <Range
                        min="0"
                        max="100"
                        step="1"
                        value={errorDiffusion}
                        onInput={this._inputChange('errorDiffusion', 'number')}
                      >
                        错误扩散:
                      </Range>
                    </div>
                    <label class={style.optionTextFirst}>
                      子采样色度:
                      <Select
                        value={uvMode}
                        onInput={this._inputChange('uvMode', 'number')}
                      >
                        <option value={UVMode.UVModeAuto}>自动</option>
                        <option value={UVMode.UVModeAdapt}>变化</option>
                        <option value={UVMode.UVMode420}>一半</option>
                        <option value={UVMode.UVMode444}>关闭</option>
                      </Select>
                    </label>
                    <label class={style.optionTextFirst}>
                      色彩空间:
                      <Select
                        value={colorSpace}
                        onInput={this._inputChange('colorSpace', 'number')}
                      >
                        <option value={Csp.kYCoCg}>YCoCg</option>
                        <option value={Csp.kYCbCr}>YCbCr</option>
                        <option value={Csp.kYIQ}>YIQ</option>
                      </Select>
                    </label>
                    <label class={style.optionToggle}>
                      随机矩阵
                      <Checkbox
                        checked={useRandomMatrix}
                        onChange={this._inputChange(
                          'useRandomMatrix',
                          'boolean',
                        )}
                      />
                    </label>
                  </div>
                )}
              </Expander>
            </div>
          )}
        </Expander>
      </form>
    );
  }
}
