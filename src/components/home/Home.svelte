<script>
  import { content_app } from "./Home";

  const { name, occupation, bio, address,  email, phone  } = content_app.main;
  const { city, state, country, zip, street} = address;

  let profilepic = "images/" + content_app.main.image;

  ////////////////
  let rn = 90; //Math.floor(Math.random() * 150 + 60);
  let rs = 100; //Math.floor(Math.random() * 11 + 4);
  let t = new Trianglify({
    x_gradient: Trianglify.colorbrewer.Spectral[rs],
    noiseIntensity: 0,
    cellsize: rn
  });
  console.log({ rs, rn });
  let pattern = t.generate(window.innerWidth, window.innerWidth + 200);
</script>

<style src="./Home.scss">

</style>

<!-- <h1>Hello {name}!</h1> -->

<!-- <div class="loader"></div> -->

<section id="about" style="background-image: {pattern.dataUrl}">
  <div class="container">
    <div class="row">
      <div class="col-md-3 col-sm-12">
        <div class="row justify-content-center">
          <div class="col-auto">
            <img alt="Image"
              class="profile-pic"
              src={profilepic}
               />
          </div>
        </div>

      </div>
      <div class="col-md-9">
        <h2>About Me</h2>

        <p>{bio}</p>
        <div class="row">
          <div class="columns contact-details">
            <h2>Contact Details</h2>
            <p class="address">
              <span>{name}</span>
              <br />
              <span>
                {street}
                <br />
                {city} {state}, {zip}
              </span>
              <br />
              <span>{phone}</span>
              <br />
              <span>{email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>

</section>
