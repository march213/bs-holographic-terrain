varying float vElevation;

void main() {
  float alpha = mod(vElevation * 30.0, 1.0);
  alpha = step(0.8, alpha);

  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
