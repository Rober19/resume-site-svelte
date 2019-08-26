<script>
  import { content_app } from "../home/Home";

  let skillmessage = content_app.resume.skillmessage;
  let education = content_app.resume.education;
  let work = content_app.resume.work;
  let skills = content_app.resume.skills;
  let skills_tags = content_app.resume.skills_tags;
  let show_content = content_app.resume;
</script>

<style src="./Resume.scss">

</style>

<div class="container">
  <section id="resume">

    {#if show_content.show_eduction}
      <div class="row education">
        <div class="three columns header-col">
          <h1>

            <span>Education</span>
          </h1>
        </div>

        <div class="nine columns main-col">
          <div class="row item">
            <div class="twelve columns">

              {#each education as { degree, school, graduated, description }, i}
                <div key={i}>
                  <h3>{school}</h3>
                  <p class="info">
                    {degree}
                    <span>&bull;</span>
                    <em class="date">{graduated}</em>
                  </p>
                  <p>{description}</p>
                </div>
              {/each}

            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if show_content.show_work}
      <div class="row work">

        <div class="three columns header-col">
          <h1>
            <span>Work</span>
          </h1>
        </div>

        <div class="nine columns main-col">

          {#each work as { company, title, years, description }, i}
            <div key={company}>
              <h3>{company}</h3>

              <p class="info">
                {title}
                <span>&bull;</span>
                <em class="date">{years}</em>
              </p>
              <p>{description}</p>
            </div>
          {/each}

        </div>
      </div>
    {/if}

    {#if show_content.show_skills}
      <div class="row skill">

        <div class="three columns header-col">
          <h1>
            <span>Skills</span>
          </h1>
        </div>

        <div class="nine columns main-col">

          <p>{skillmessage}</p>

          <div class="bars">
            <ul class="skills">
              {#each skills as { name, className, level }, i}
                <li key={name}>
                  <span
                    style=" width: {level}
                    "
                    class="bar-expand {name.toLowerCase()}" />
                  <em>{name}</em>
                </li>
              {/each}
            </ul>
          </div>

        </div>
      </div>
    {/if}
    {#if show_content.show_skills_tags}
      <div class="row">
        <div class="col-md-12">
      <center>
          <div >
            <h1 style="font-size: 25px">
              {show_content.skills_tags_titles.title_1}
            </h1>
          </div></center>

          <div class="header-col">
            <h1>
              <span>{show_content.skills_tags_titles.lvl_1}</span>
            </h1>
          </div>

          <ul class="tags ">
            {#each skills_tags.advanced as { name }}
              <li>
                <a href="##" class="tag tag_1">{name}</a>
              </li>
            {/each}

          </ul>

          <div class="header-col">
            <h1>
              <span>{show_content.skills_tags_titles.lvl_2}</span>
            </h1>
          </div>

          <ul class="tags">
            {#each skills_tags.intermediate as { name }}
              <li>
                <a href="##"   class="tag tag_2">{name}</a>
              </li>
            {/each}

          </ul>

          <div class="header-col">
            <h1>
              <span>{show_content.skills_tags_titles.lvl_3}</span>
            </h1>
          </div>

          <ul class="tags">
            {#each skills_tags.hobby as { name }}
              <li>
                <a href="##"  class="tag tag_3">{name}</a>
              </li>
            {/each}

          </ul>
        </div>
      </div>
    {/if}

  </section>

</div>
