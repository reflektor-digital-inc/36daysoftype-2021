#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform float time;

float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st);
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st);
    return uv.x*uv.y;
}

float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) +
            box(_st, vec2(_size/4.,_size));
}

void main(){
    vec2 uv = vUv;
    vec3 color = vec3(1.0);

    // To move the cross we move the space
    vec2 translate = vec2(cos(time),sin(time));
    uv += translate*0.35;

    // Add the shape on the foreground
    color -= vec3(cross(uv, 0.25));

    gl_FragColor = vec4(color,1.0);
}
