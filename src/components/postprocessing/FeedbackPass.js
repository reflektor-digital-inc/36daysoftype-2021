import feedbackFrag from '@shaders/feedback.frag';
import baseVertex from '@shaders/baseVertex.vert';
import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';

class FeedbackPass extends Pass {
  constructor(intensity = 0) {
    super();

    this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter : LinearFilter,
      magFilter : NearestFilter,
      format : RGBAFormat
    });

    this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter : LinearFilter,
      magFilter : NearestFilter,
      format : RGBAFormat
    });

    this.shaderMaterial = new ShaderMaterial({
      uniforms : {
        intensity : { value : intensity },
        tOld : { value : null },
        tNew : { value : null },
        time : { value : 0 }
      },
      vertexShader : baseVertex,
      fragmentShader : feedbackFrag
    });

    this.compFsQuad = new FullScreenQuad(this.shaderMaterial);
    const material = new MeshBasicMaterial();
    this.copyFsQuad = new FullScreenQuad(material);
  }

  render(renderer, writeBuffer, readBuffer, deltaTime/*, maskActive*/) {
    this.shaderMaterial.uniforms[ 'tOld' ].value = this.textureOld.texture;
    this.shaderMaterial.uniforms[ 'tNew' ].value = readBuffer.texture;
    this.shaderMaterial.uniforms.time.value += deltaTime;

    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);

    this.copyFsQuad.material.map = this.textureComp.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);
    }
    else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.copyFsQuad.render(renderer);
    }

		// Swap buffers.
    const temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.
  }

  setSize(width, height) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }

  get intensity() {
    return this.shaderMaterial.uniforms.intensity.value;
  }

  set intensity(value) {
    this.shaderMaterial.uniforms.intensity.value = value;
  }
}

export { FeedbackPass };
