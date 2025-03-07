import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'radar';

  constructor(
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.init();
  }

  init(): void {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x999999 );

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 0.5, 1.0, 0.5 ).normalize();

    scene.add( light );

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.y = 5;
    camera.position.z = 10;

    scene.add( camera );

    const grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x7b7b7b );
    scene.add( grid );

    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const cylinderPie = [];
    const indexArr = [0,1,2,3];
    for (let i = 0; i < indexArr.length; i++) {
      const radiusSlice = 1;
      const extrudeSettingsSlice = {
        steps: 55,
        depth: 1 * i, // высота
        bevelEnabled: false,
      };
      const materialSlice = new THREE.MeshLambertMaterial({ color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][i] });
      const shapeSlice = new THREE.Shape();
      shapeSlice.moveTo(radiusSlice, 0); // важно подвинуть чтобы была полная фигура
      shapeSlice.arc(0, 0, radiusSlice, i * (Math.PI * 2) / indexArr.length, (i + 1) * (Math.PI * 2) / indexArr.length, false);
      shapeSlice.lineTo(radiusSlice, 0);
      const geometrySlice = new THREE.ExtrudeGeometry(shapeSlice, extrudeSettingsSlice);
      geometrySlice.rotateX(Math.PI * 0.5);
      const meshSlice = new THREE.Mesh(geometrySlice, materialSlice);
      meshSlice.position.y = extrudeSettingsSlice.depth;


      cylinderPie.push(meshSlice);
      const group = new THREE.Group();
      group.add(meshSlice);
      group.position.x = -1;
      scene.add(group);
    }

    render();

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

      render();
    }

    function render() {
      renderer.render( scene, camera );
    }
  }
}
